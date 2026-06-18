"use server";

import { revalidatePath } from "next/cache";
import { USE_MOCK } from "./queries";
import { setOverride, addManualCase } from "./mock-store";
import type { ManualCaseInput, RetrospectiveFields, StrokeCase } from "./types";

/**
 * Guarda los campos de outcome cargados retrospectivamente (origen C).
 * Modo mock → override en memoria. Modo real → UPDATE a `stroke_events`.
 */
export async function saveRetrospective(
  id: string,
  fields: Partial<RetrospectiveFields>
): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    setOverride(id, fields);
  } else {
    const { createServerSupabaseClient } = await import("./supabase-server");
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("stroke_events")
      .update({
        age: fields.age,
        sex: fields.sex,
        mrs_baseline: fields.mrsBaseline,
        mrs_discharge: fields.mrsDischarge,
        mrs_90d: fields.mrs90d,
        length_of_stay_days: fields.lengthOfStayDays,
        discharge_destination: fields.dischargeDestination,
        toast_etiology: fields.toastEtiology,
        symptomatic_ich: fields.symptomaticICH,
        mortality_90d: fields.mortality90d,
      })
      .eq("id", id);
    if (error) return { ok: false };
  }

  revalidatePath(`/dashboard/casos/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/casos");
  return { ok: true };
}

/**
 * Crea un caso cargado manualmente (ACV evolucionado / fuera de ventana / carga
 * retrospectiva), POR FUERA del código stroke. No dispara nada del protocolo;
 * solo inserta un evento con source 'manual' y form_status 'completed'.
 * Modo mock → lo agrega a la lista en memoria. Modo real → INSERT a `stroke_events`.
 */
export async function createManualCase(
  input: ManualCaseInput
): Promise<{ ok: boolean; id?: string }> {
  const id = crypto.randomUUID();
  const createdAt = input.createdAt || new Date().toISOString();

  if (USE_MOCK) {
    const c: StrokeCase = {
      id,
      createdAt,
      patientAlias: input.patientAlias ?? null,
      source: "manual",
      formStatus: "completed",
      age: input.age ?? null,
      sex: input.sex ?? null,
      nihssScore: input.nihssScore ?? null,
      aspectsScore: input.aspectsScore ?? null,
      isWakeUpStroke: input.isWakeUpStroke ?? null,
      hasLvo: input.hasLvo ?? null,
      lvoSite: input.lvoSite ?? null,
      symptomOnset: input.symptomOnset ?? null,
      doorTime: input.doorTime ?? null,
      ctRequestTime: null,
      thrombolyticStart: null,
      angioRequestTime: null,
      thrombectomyActivation: null,
      thrombolysisGiven: input.thrombolysisGiven ?? null,
      drugUsed: input.drugUsed ?? null,
      thrombectomyDone: input.thrombectomyDone ?? null,
      hasBleeding: input.hasBleeding ?? null,
      mrsBaseline: input.mrsBaseline ?? null,
      mrsDischarge: input.mrsDischarge ?? null,
      mrs90d: input.mrs90d ?? null,
      lengthOfStayDays: input.lengthOfStayDays ?? null,
      dischargeDestination: input.dischargeDestination ?? null,
      toastEtiology: input.toastEtiology ?? null,
      symptomaticICH: input.symptomaticICH ?? null,
      mortality90d: input.mortality90d ?? null,
    };
    addManualCase(c);
  } else {
    const { createServerSupabaseClient } = await import("./supabase-server");
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("stroke_events").insert({
      id,
      created_at: createdAt,
      source: "manual",
      form_status: "completed",
      patient_alias: input.patientAlias,
      age: input.age,
      sex: input.sex,
      nihss_score: input.nihssScore,
      aspects_score: input.aspectsScore,
      is_wake_up_stroke: input.isWakeUpStroke,
      has_lvo: input.hasLvo,
      lvo_site: input.lvoSite,
      symptom_onset_time: input.symptomOnset,
      door_time: input.doorTime,
      thrombolysis_given: input.thrombolysisGiven,
      drug_used: input.drugUsed,
      thrombectomy_activated: input.thrombectomyDone,
      has_bleeding: input.hasBleeding,
      mrs_baseline: input.mrsBaseline,
      mrs_discharge: input.mrsDischarge,
      mrs_90d: input.mrs90d,
      length_of_stay_days: input.lengthOfStayDays,
      discharge_destination: input.dischargeDestination,
      toast_etiology: input.toastEtiology,
      symptomatic_ich: input.symptomaticICH,
      mortality_90d: input.mortality90d,
    });
    if (error) return { ok: false };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/casos");
  return { ok: true, id };
}
