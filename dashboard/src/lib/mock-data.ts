// ─────────────────────────────────────────────────────────────────────────────
// Capa de datos MOCK + agregadores puros.
//
// Los casos se generan de forma DETERMINISTA (PRNG sembrado) para que la demo
// se vea idéntica en cada recarga. Los agregadores son funciones puras sobre
// StrokeCase[] — los mismos que usará el path de Supabase real, garantizando
// que mock y producción calculen las métricas exactamente igual.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type StrokeCase,
  type Drug,
  type MrsScore,
  type DischargeDestination,
  type ToastEtiology,
  type Sex,
  deriveTimes,
  isFavorableMrs,
} from "./types";

// ── PRNG determinista (mulberry32) ─────────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260609);
const rand = () => rng();
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const chance = (p: number) => rand() < p;
/** Aproximación normal (suma de uniformes) acotada. */
function gaussian(mean: number, sd: number, min: number, max: number): number {
  const u = (rand() + rand() + rand() + rand() - 2) / 2; // ~N(0,1) acotado
  return Math.round(Math.min(max, Math.max(min, mean + u * sd)));
}

const FIRST = ["García", "López", "Pérez", "Fernández", "Rodríguez", "Sosa", "Romero", "Díaz", "Torres", "Ruiz", "Acosta", "Benítez", "Méndez", "Vega"];
const SECOND = ["Juan", "María", "Carlos", "Ana", "Jorge", "Lucía", "Pedro", "Sofía", "Raúl", "Elena", "Hugo", "Marta", "Diego", "Clara"];

function alias(): string {
  const a = pick(FIRST)[0];
  const b = pick(SECOND)[0];
  return `${a}${b}${randInt(100, 999)}`;
}

function addMin(iso: string, min: number): string {
  return new Date(new Date(iso).getTime() + min * 60000).toISOString();
}

const DESTINATIONS: DischargeDestination[] = ["home", "home", "rehab", "rehab", "other_facility", "death"];
const TOASTS: ToastEtiology[] = ["laa", "cardioembolic", "cardioembolic", "lacunar", "other", "undetermined"];

/** Genera un caso clínicamente coherente para `monthOffset` meses atrás. */
function makeCase(i: number, monthsAgo: number): StrokeCase {
  const now = new Date("2026-06-09T12:00:00");
  const base = new Date(now.getFullYear(), now.getMonth() - monthsAgo, randInt(1, 28), randInt(7, 22), randInt(0, 59));
  const doorTime = base.toISOString();

  const inProgress = monthsAgo === 0 && chance(0.15);
  const nihss = gaussian(11, 6, 1, 30);
  const age = gaussian(70, 13, 38, 95);
  const sex: Sex = chance(0.52) ? "M" : "F";

  // ~62% reciben trombólisis; de los tratados, DTN ~ centrado en 48 min.
  const thrombolysisGiven = !inProgress && chance(0.62);
  const drug: Drug | null = thrombolysisGiven ? (chance(0.45) ? "tnk" : "rtpa") : null;

  const onsetToDoor = randInt(25, 150);
  const symptomOnset = chance(0.18) ? null : addMin(doorTime, -onsetToDoor); // wake-up = onset desconocido
  const isWakeUpStroke = symptomOnset === null;

  const doorToCt = gaussian(22, 9, 8, 55);
  const ctRequestTime = addMin(doorTime, doorToCt);
  const hasBleeding = chance(0.05);

  const dtn = gaussian(48, 16, 18, 110);
  const thrombolyticStart = thrombolysisGiven ? addMin(doorTime, dtn) : null;

  // ~22% van a trombectomía
  const thrombectomyDone = !inProgress && !hasBleeding && chance(0.22);
  const angioRequestTime = thrombectomyDone ? addMin(doorTime, randInt(30, 90)) : null;
  const thrombectomyActivation = thrombectomyDone ? addMin(doorTime, randInt(60, 140)) : null;
  const aspectsScore = thrombectomyDone ? gaussian(8, 1.5, 4, 10) : null;

  // ── Outcomes retrospectivos (origen C) — solo en casos completados ──
  const mrsBaseline: MrsScore | null = inProgress ? null : (chance(0.7) ? 0 : (pick([0, 1, 1, 2, 3]) as MrsScore));
  // El tratamiento mejora el outcome; mayor NIHSS → peor pronóstico.
  let mrs90: MrsScore | null = null;
  let mrsDischarge: MrsScore | null = null;
  let mortality90 = false;
  let sich = false;
  if (!inProgress) {
    const severityShift = nihss > 18 ? 2 : nihss > 10 ? 1 : 0;
    const treatBonus = thrombolysisGiven || thrombectomyDone ? -1 : 0;
    const target = Math.max(0, Math.min(6, (mrsBaseline ?? 0) + severityShift + treatBonus + randInt(0, 2)));
    sich = thrombolysisGiven && chance(0.045); // sICH ~4-5% en tratados
    mortality90 = chance(0.12) || target >= 6 || sich;
    mrs90 = (mortality90 ? 6 : (target as MrsScore));
    mrsDischarge = (mortality90 ? 6 : Math.min(6, target + (chance(0.5) ? 1 : 0))) as MrsScore;
  }

  const lengthOfStayDays = inProgress ? null : (mortality90 && chance(0.4) ? randInt(1, 6) : gaussian(9, 5, 2, 35));
  const dischargeDestination: DischargeDestination | null = inProgress
    ? null
    : mortality90
    ? "death"
    : pick(DESTINATIONS.filter((d) => d !== "death"));
  const toastEtiology: ToastEtiology | null = inProgress ? null : pick(TOASTS);

  return {
    id: `mock-${String(i).padStart(3, "0")}`,
    createdAt: doorTime,
    patientAlias: alias(),
    source: chance(0.25) ? "sheets_import" : "app",
    formStatus: inProgress ? "in_progress" : "completed",
    age,
    sex,
    nihssScore: nihss,
    aspectsScore,
    isWakeUpStroke,
    symptomOnset,
    doorTime,
    ctRequestTime,
    thrombolyticStart,
    angioRequestTime,
    thrombectomyActivation,
    thrombolysisGiven,
    drugUsed: drug,
    thrombectomyDone,
    hasBleeding,
    mrsBaseline,
    mrsDischarge,
    mrs90d: mrs90,
    lengthOfStayDays,
    dischargeDestination,
    toastEtiology,
    symptomaticICH: inProgress ? null : sich,
    mortality90d: inProgress ? null : mortality90,
  };
}

function generate(): StrokeCase[] {
  const cases: StrokeCase[] = [];
  let i = 1;
  // 8 meses, 4-9 casos por mes
  for (let m = 7; m >= 0; m--) {
    const n = randInt(4, 9);
    for (let k = 0; k < n; k++) cases.push(makeCase(i++, m));
  }
  // Orden descendente por fecha
  return cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Dataset mock determinista, generado una vez por proceso. */
export const MOCK_CASES: StrokeCase[] = generate();

// ─────────────────────────────────────────────────────────────────────────────
// Agregadores puros (reutilizables por el path real)
// ─────────────────────────────────────────────────────────────────────────────

export interface QualityMetrics {
  totalCases: number;
  casesThisMonth: number;
  avgDtn: number | null;
  pctDtnUnder60: number | null;
  pctDtnUnder45: number | null;
  avgDoorToCt: number | null;
  thrombolysisRate: number | null;
  thrombectomyRate: number | null;
  sichRate: number | null;
  mrs90FavorableRate: number | null;
  mortality90Rate: number | null;
}

const avg = (xs: number[]): number | null =>
  xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;
const pct = (num: number, den: number): number | null =>
  den ? Math.round((100 * num) / den) : null;

export function computeQualityMetrics(cases: StrokeCase[]): QualityMetrics {
  const done = cases.filter((c) => c.formStatus === "completed");
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const dtns = done.map((c) => deriveTimes(c).doorToNeedleMin).filter((v): v is number => v !== null);
  const dtcs = done.map((c) => deriveTimes(c).doorToCtMin).filter((v): v is number => v !== null);
  const treated = done.filter((c) => c.thrombolysisGiven);
  const sich = treated.filter((c) => c.symptomaticICH).length;
  const mrs90Known = done.filter((c) => c.mrs90d !== null);
  const mortKnown = done.filter((c) => c.mortality90d !== null);

  return {
    totalCases: done.length,
    casesThisMonth: done.filter((c) => c.createdAt >= monthStart).length,
    avgDtn: avg(dtns),
    pctDtnUnder60: dtns.length ? pct(dtns.filter((v) => v <= 60).length, dtns.length) : null,
    pctDtnUnder45: dtns.length ? pct(dtns.filter((v) => v <= 45).length, dtns.length) : null,
    avgDoorToCt: avg(dtcs),
    thrombolysisRate: pct(treated.length, done.length),
    thrombectomyRate: pct(done.filter((c) => c.thrombectomyDone).length, done.length),
    sichRate: treated.length ? pct(sich, treated.length) : null,
    mrs90FavorableRate: mrs90Known.length
      ? pct(mrs90Known.filter((c) => isFavorableMrs(c.mrs90d)).length, mrs90Known.length)
      : null,
    mortality90Rate: mortKnown.length
      ? pct(mortKnown.filter((c) => c.mortality90d).length, mortKnown.length)
      : null,
  };
}

export interface MonthlyDtnRow {
  month: string;
  avg_dtn: number | null;
  count: number;
}

export function computeDtnByMonth(cases: StrokeCase[]): MonthlyDtnRow[] {
  const byMonth: Record<string, number[]> = {};
  for (const c of cases) {
    if (c.formStatus !== "completed") continue;
    const dtn = deriveTimes(c).doorToNeedleMin;
    if (dtn === null) continue;
    const month = c.createdAt.slice(0, 7);
    (byMonth[month] ??= []).push(dtn);
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({ month, avg_dtn: avg(vals), count: vals.length }));
}

export interface MonthlyThrombolysisRow {
  month: string;
  total: number;
  with_thrombolysis: number;
  rate: number;
}

export function computeThrombolysisByMonth(cases: StrokeCase[]): MonthlyThrombolysisRow[] {
  const byMonth: Record<string, { total: number; with: number }> = {};
  for (const c of cases) {
    if (c.formStatus !== "completed") continue;
    const month = c.createdAt.slice(0, 7);
    const m = (byMonth[month] ??= { total: 0, with: 0 });
    m.total += 1;
    if (c.thrombolysisGiven) m.with += 1;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { total, with: w }]) => ({
      month,
      total,
      with_thrombolysis: w,
      rate: Math.round((100 * w) / total),
    }));
}

export interface MrsDistributionRow {
  score: MrsScore;
  baseline: number;
  at90d: number;
}

/** Distribución de mRS basal vs 90 días — base del gráfico de "shift". */
export function computeMrsDistribution(cases: StrokeCase[]): MrsDistributionRow[] {
  const rows: MrsDistributionRow[] = ([0, 1, 2, 3, 4, 5, 6] as MrsScore[]).map((score) => ({
    score,
    baseline: 0,
    at90d: 0,
  }));
  for (const c of cases) {
    if (c.formStatus !== "completed") continue;
    if (c.mrsBaseline !== null) rows[c.mrsBaseline].baseline += 1;
    if (c.mrs90d !== null) rows[c.mrs90d].at90d += 1;
  }
  return rows;
}
