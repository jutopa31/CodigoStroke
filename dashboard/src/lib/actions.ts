"use server";

import { revalidatePath } from "next/cache";
import { USE_MOCK } from "./queries";
import { setOverride } from "./mock-store";
import type { RetrospectiveFields } from "./types";

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
