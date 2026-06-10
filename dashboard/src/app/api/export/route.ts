import { getAllCompletedCases, type CaseFilters } from "@/lib/queries";
import {
  deriveTimes,
  DRUG_LABEL,
  SOURCE_LABEL,
  DESTINATION_LABEL,
  TOAST_LABEL,
} from "@/lib/types";

// Export de-identificado del dataset (alias, sin DNI) para análisis estadístico.

const COLUMNS = [
  "id",
  "fecha",
  "alias",
  "edad",
  "sexo",
  "fuente",
  "nihss",
  "aspects",
  "wake_up",
  "door_to_needle_min",
  "onset_to_needle_min",
  "door_to_ct_min",
  "door_to_groin_min",
  "trombolisis",
  "droga",
  "trombectomia",
  "hemorragia_tc",
  "mrs_basal",
  "mrs_alta",
  "mrs_90d",
  "dias_internacion",
  "destino_alta",
  "etiologia_toast",
  "sich",
  "mortalidad_90d",
] as const;

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const yn = (b: boolean | null) => (b === null ? "" : b ? "si" : "no");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters: CaseFilters = {
    source: url.searchParams.get("source") ?? undefined,
    drug: url.searchParams.get("drug") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  };

  const all = await getAllCompletedCases();
  const cases = all.filter((c) => {
    if (filters.source && c.source !== filters.source) return false;
    if (filters.drug && c.drugUsed !== filters.drug) return false;
    if (filters.from && c.createdAt < filters.from) return false;
    if (filters.to && c.createdAt > `${filters.to}T23:59:59`) return false;
    return true;
  });

  const lines = [COLUMNS.join(",")];
  for (const c of cases) {
    const d = deriveTimes(c);
    const row = [
      c.id,
      c.createdAt?.slice(0, 10) ?? "",
      c.patientAlias ?? "",
      c.age ?? "",
      c.sex ?? "",
      SOURCE_LABEL[c.source],
      c.nihssScore ?? "",
      c.aspectsScore ?? "",
      yn(c.isWakeUpStroke),
      d.doorToNeedleMin ?? "",
      d.onsetToNeedleMin ?? "",
      d.doorToCtMin ?? "",
      d.doorToGroinMin ?? "",
      yn(c.thrombolysisGiven),
      c.drugUsed ? DRUG_LABEL[c.drugUsed] : "",
      yn(c.thrombectomyDone),
      yn(c.hasBleeding),
      c.mrsBaseline ?? "",
      c.mrsDischarge ?? "",
      c.mrs90d ?? "",
      c.lengthOfStayDays ?? "",
      c.dischargeDestination ? DESTINATION_LABEL[c.dischargeDestination] : "",
      c.toastEtiology ? TOAST_LABEL[c.toastEtiology] : "",
      yn(c.symptomaticICH),
      yn(c.mortality90d),
    ];
    lines.push(row.map(csvCell).join(","));
  }

  const csv = "﻿" + lines.join("\n"); // BOM para Excel
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="codigo-stroke-casos-${stamp}.csv"`,
    },
  });
}
