import { createServerSupabaseClient } from "./supabase-server";

export interface MonthlyDtnRow {
  month: string;
  avg_dtn: number | null;
  count: number;
}

export interface MonthlyThrombolysisRow {
  month: string;
  total: number;
  with_thrombolysis: number;
  rate: number;
}

export interface SourceRow {
  source: string;
  count: number;
}

export interface CaseRow {
  id: string;
  created_at: string;
  patient_alias: string | null;
  nihss_score: number | null;
  door_to_needle_min: number | null;
  drug_used: string | null;
  form_status: string | null;
  source: string | null;
  thrombolysis_given: boolean | null;
}

export interface SummaryStats {
  totalCases: number;
  avgDtn: number | null;
  thrombolysisRate: number | null;
  casesThisMonth: number;
  sheetsImportRatio: number | null;
}

export async function getSummaryStats(): Promise<SummaryStats> {
  const supabase = await createServerSupabaseClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [allRes, monthRes, dtnRes, thrombolysisRes, sourceRes] =
    await Promise.all([
      supabase
        .from("stroke_events")
        .select("id", { count: "exact", head: true })
        .eq("form_status", "completed"),
      supabase
        .from("stroke_events")
        .select("id", { count: "exact", head: true })
        .eq("form_status", "completed")
        .gte("created_at", monthStart),
      supabase
        .from("stroke_events")
        .select("door_to_needle_min")
        .not("door_to_needle_min", "is", null)
        .eq("form_status", "completed"),
      supabase
        .from("stroke_events")
        .select("thrombolysis_given")
        .eq("form_status", "completed"),
      supabase
        .from("stroke_events")
        .select("source")
        .eq("form_status", "completed"),
    ]);

  const totalCases = allRes.count ?? 0;
  const casesThisMonth = monthRes.count ?? 0;

  const dtnValues = (dtnRes.data ?? [])
    .map((r) => r.door_to_needle_min)
    .filter((v): v is number => v !== null);
  const avgDtn =
    dtnValues.length > 0
      ? Math.round(dtnValues.reduce((a, b) => a + b, 0) / dtnValues.length)
      : null;

  const thromboData = thrombolysisRes.data ?? [];
  const thrombolysisRate =
    thromboData.length > 0
      ? Math.round(
          (100 * thromboData.filter((r) => r.thrombolysis_given).length) /
            thromboData.length
        )
      : null;

  const sourceData = sourceRes.data ?? [];
  const sheetsCount = sourceData.filter((r) => r.source === "sheets_import").length;
  const sheetsImportRatio =
    sourceData.length > 0
      ? Math.round((100 * sheetsCount) / sourceData.length)
      : null;

  return { totalCases, avgDtn, thrombolysisRate, casesThisMonth, sheetsImportRatio };
}

export async function getDoorToNeedleByMonth(): Promise<MonthlyDtnRow[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("stroke_events")
    .select("created_at, door_to_needle_min")
    .not("door_to_needle_min", "is", null)
    .eq("form_status", "completed")
    .order("created_at");

  if (!data) return [];

  const byMonth: Record<string, number[]> = {};
  for (const row of data) {
    const month = row.created_at.slice(0, 7); // "YYYY-MM"
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(row.door_to_needle_min as number);
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      month,
      avg_dtn: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      count: vals.length,
    }));
}

export async function getThrombolysisRateByMonth(): Promise<MonthlyThrombolysisRow[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("stroke_events")
    .select("created_at, thrombolysis_given")
    .eq("form_status", "completed")
    .order("created_at");

  if (!data) return [];

  const byMonth: Record<string, { total: number; with_thrombolysis: number }> = {};
  for (const row of data) {
    const month = row.created_at.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = { total: 0, with_thrombolysis: 0 };
    byMonth[month].total += 1;
    if (row.thrombolysis_given) byMonth[month].with_thrombolysis += 1;
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { total, with_thrombolysis }]) => ({
      month,
      total,
      with_thrombolysis,
      rate: Math.round((100 * with_thrombolysis) / total),
    }));
}

export async function getRecentCases(
  page = 1,
  filters: { source?: string; from?: string; to?: string; drug?: string } = {}
): Promise<{ data: CaseRow[]; count: number }> {
  const supabase = await createServerSupabaseClient();
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("stroke_events")
    .select(
      "id, created_at, patient_alias, nihss_score, door_to_needle_min, drug_used, form_status, source, thrombolysis_given",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (filters.source) query = query.eq("source", filters.source);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.drug) query = query.eq("drug_used", filters.drug);

  const { data, count } = await query;
  return { data: (data ?? []) as CaseRow[], count: count ?? 0 };
}
