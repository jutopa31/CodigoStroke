// ─────────────────────────────────────────────────────────────────────────────
// Provider de datos INTERCAMBIABLE.
//
//   USE_MOCK = true  → lee del dataset mock determinista (default por ahora)
//   USE_MOCK = false → lee de Supabase, mapea a StrokeCase y corre LOS MISMOS
//                      agregadores puros que el path mock.
//
// Cambiar de mock a real es flipear NEXT_PUBLIC_USE_MOCK=false y tener datos
// en `stroke_events`. Ningún componente de UI cambia.
// ─────────────────────────────────────────────────────────────────────────────

import type { StrokeCase, Drug } from "./types";
import {
  MOCK_CASES,
  computeQualityMetrics,
  computeDtnByMonth,
  computeThrombolysisByMonth,
  computeMrsDistribution,
  type QualityMetrics,
  type MonthlyDtnRow,
  type MonthlyThrombolysisRow,
  type MrsDistributionRow,
} from "./mock-data";
import { getOverride } from "./mock-store";

export type {
  QualityMetrics,
  MonthlyDtnRow,
  MonthlyThrombolysisRow,
  MrsDistributionRow,
};

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const PAGE_SIZE = 20;

export interface CaseFilters {
  source?: string;
  from?: string;
  to?: string;
  drug?: string;
}

// ── Carga de todos los casos según el origen activo ─────────────────────────────

/** Aplica los overrides retrospectivos en memoria (modo mock). */
function withOverrides(c: StrokeCase): StrokeCase {
  const o = getOverride(c.id);
  return o ? { ...c, ...o } : c;
}

async function loadAllCases(): Promise<StrokeCase[]> {
  if (USE_MOCK) return MOCK_CASES.map(withOverrides);

  // ── Path Supabase real ──
  const { createServerSupabaseClient } = await import("./supabase-server");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("stroke_events")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapRowToCase);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Mapea una fila de `stroke_events` al modelo de dominio. */
function mapRowToCase(row: any): StrokeCase {
  return {
    id: row.id,
    createdAt: row.created_at,
    patientAlias: row.patient_alias ?? null,
    source: row.source ?? "app",
    formStatus: row.form_status === "completed" ? "completed" : "in_progress",
    age: row.age ?? null,
    sex: row.sex ?? null,
    nihssScore: row.nihss_score ?? null,
    aspectsScore: row.aspects_score ?? null,
    isWakeUpStroke: row.is_wake_up_stroke ?? null,
    symptomOnset: row.symptom_onset_time ?? null,
    doorTime: row.door_time ?? null,
    ctRequestTime: row.ct_request_time ?? null,
    thrombolyticStart: row.thrombolytic_start_at ?? null,
    angioRequestTime: row.angio_request_time ?? null,
    thrombectomyActivation: row.thrombectomy_activation_at ?? null,
    thrombolysisGiven: row.thrombolysis_given ?? null,
    drugUsed: (row.drug_used as Drug) ?? null,
    thrombectomyDone: row.thrombectomy_activated ?? null,
    hasBleeding: row.has_bleeding ?? null,
    // Origen C — columnas a agregar por migración; null hasta entonces.
    mrsBaseline: row.patient_mrs_score ?? row.mrs_baseline ?? null,
    mrsDischarge: row.mrs_discharge ?? null,
    mrs90d: row.mrs_90d ?? null,
    lengthOfStayDays: row.length_of_stay_days ?? null,
    dischargeDestination: row.discharge_destination ?? null,
    toastEtiology: row.toast_etiology ?? null,
    symptomaticICH: row.symptomatic_ich ?? null,
    mortality90d: row.mortality_90d ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── API pública ─────────────────────────────────────────────────────────────────

export async function getQualityMetrics(): Promise<QualityMetrics> {
  return computeQualityMetrics(await loadAllCases());
}

export async function getDtnByMonth(): Promise<MonthlyDtnRow[]> {
  return computeDtnByMonth(await loadAllCases());
}

export async function getThrombolysisByMonth(): Promise<MonthlyThrombolysisRow[]> {
  return computeThrombolysisByMonth(await loadAllCases());
}

export async function getMrsDistribution(): Promise<MrsDistributionRow[]> {
  return computeMrsDistribution(await loadAllCases());
}

export async function getRecentCases(
  page = 1,
  filters: CaseFilters = {}
): Promise<{ data: StrokeCase[]; count: number }> {
  const all = (await loadAllCases()).filter((c) => c.formStatus === "completed");
  const filtered = all.filter((c) => {
    if (filters.source && c.source !== filters.source) return false;
    if (filters.drug && c.drugUsed !== filters.drug) return false;
    if (filters.from && c.createdAt < filters.from) return false;
    if (filters.to && c.createdAt > `${filters.to}T23:59:59`) return false;
    return true;
  });
  const from = (page - 1) * PAGE_SIZE;
  return { data: filtered.slice(from, from + PAGE_SIZE), count: filtered.length };
}

export async function getCaseById(id: string): Promise<StrokeCase | null> {
  return (await loadAllCases()).find((c) => c.id === id) ?? null;
}

/** Todos los casos completados, para export. */
export async function getAllCompletedCases(): Promise<StrokeCase[]> {
  return (await loadAllCases()).filter((c) => c.formStatus === "completed");
}

export { USE_MOCK };
