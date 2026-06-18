// ─────────────────────────────────────────────────────────────────────────────
// Modelo de dominio del Hub de pacientes — fuente única de verdad.
//
// Un StrokeCase combina tres orígenes de datos:
//   A) Lo que la app móvil ya sincroniza a `stroke_events` (tiempos, NIHSS, droga…)
//   B) Derivados/calculados (DTN, onset-to-needle, door-to-CT, door-to-groin)
//   C) Lo que EXCEDE la app y se carga retrospectivamente desde la HC
//      (mRS basal/alta/90d, días de internación, destino, etiología, sICH, mortalidad)
//
// La UI consume SIEMPRE este tipo. El origen (mock o Supabase) es intercambiable
// detrás de queries.ts; cambiar de mock a real no toca un solo componente.
// ─────────────────────────────────────────────────────────────────────────────

export type CaseSource = "app" | "sheets_import" | "manual";
export type FormStatus = "in_progress" | "completed";
export type Sex = "M" | "F";
export type Drug = "tnk" | "rtpa";

/** Escala de Rankin modificada (mRS): 0 = sin síntomas … 5 = discapacidad grave, 6 = muerte. */
export type MrsScore = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DischargeDestination =
  | "home" // domicilio
  | "rehab" // rehabilitación
  | "other_facility" // otra institución
  | "death"; // óbito intrahospitalario

/** Clasificación etiológica TOAST. */
export type ToastEtiology =
  | "laa" // aterotrombótico de gran arteria
  | "cardioembolic" // cardioembólico
  | "lacunar" // pequeño vaso / lacunar
  | "other" // otra causa determinada
  | "undetermined"; // indeterminado

/** Sitio de oclusión de gran vaso (OGV / LVO) en angio-TC. */
export type LvoSite =
  | "ica" // carótida interna (incl. carótida-T)
  | "m1" // ACM segmento M1
  | "m2" // ACM segmento M2
  | "aca" // cerebral anterior
  | "pca" // cerebral posterior
  | "basilar" // basilar
  | "tandem"; // lesión en tándem (extra + intracraneal)

export interface StrokeCase {
  // ── Identidad ──────────────────────────────────────────────────────────────
  id: string;
  createdAt: string; // ISO — fecha/hora del caso
  patientAlias: string | null; // ID legible "GJ678" (sin DNI en claro)
  source: CaseSource;
  formStatus: FormStatus;

  // ── Demografía ───────────────────────────────────────────────────────────── (C, parcial)
  age: number | null;
  sex: Sex | null;

  // ── Presentación aguda ─────────────────────────────────────────────────────── (A)
  nihssScore: number | null;
  aspectsScore: number | null;
  isWakeUpStroke: boolean | null;
  hasLvo: boolean | null; // oclusión de gran vaso (OGV) en angio-TC
  lvoSite: LvoSite | null; // vaso ocluido (si hasLvo)

  // ── Tiempos del protocolo (ISO) ────────────────────────────────────────────── (A)
  symptomOnset: string | null; // último visto sano / inicio
  doorTime: string | null; // arribo a puerta
  ctRequestTime: string | null; // pedido de TC
  thrombolyticStart: string | null; // inicio del trombolítico
  angioRequestTime: string | null; // pedido de angio
  thrombectomyActivation: string | null; // activación de trombectomía

  // ── Tratamiento ────────────────────────────────────────────────────────────── (A)
  thrombolysisGiven: boolean | null;
  drugUsed: Drug | null;
  thrombectomyDone: boolean | null;
  hasBleeding: boolean | null; // hemorragia en TC inicial

  // ── Outcomes / carga retrospectiva ───────────────────────────────────────────── (C)
  mrsBaseline: MrsScore | null; // funcionalidad previa
  mrsDischarge: MrsScore | null; // funcionalidad al alta
  mrs90d: MrsScore | null; // funcionalidad a 90 días
  lengthOfStayDays: number | null; // días de internación
  dischargeDestination: DischargeDestination | null;
  toastEtiology: ToastEtiology | null;
  symptomaticICH: boolean | null; // transformación hemorrágica sintomática (SITS-MOST)
  mortality90d: boolean | null;
}

/** Campos de outcome editables retrospectivamente desde la ficha (origen C). */
export type RetrospectiveFields = Pick<
  StrokeCase,
  | "age"
  | "sex"
  | "mrsBaseline"
  | "mrsDischarge"
  | "mrs90d"
  | "lengthOfStayDays"
  | "dischargeDestination"
  | "toastEtiology"
  | "symptomaticICH"
  | "mortality90d"
>;

/**
 * Datos para crear un caso manual desde el dashboard (ACV evolucionado /
 * fuera de ventana / carga retrospectiva). Combina presentación aguda,
 * tiempos y outcomes; el `id`, `source` y `createdAt` los pone la acción.
 */
export type ManualCaseInput = Pick<
  StrokeCase,
  | "patientAlias"
  | "age"
  | "sex"
  | "nihssScore"
  | "aspectsScore"
  | "isWakeUpStroke"
  | "hasLvo"
  | "lvoSite"
  | "symptomOnset"
  | "doorTime"
  | "thrombolysisGiven"
  | "drugUsed"
  | "thrombectomyDone"
  | "hasBleeding"
  | "mrsBaseline"
  | "mrsDischarge"
  | "mrs90d"
  | "lengthOfStayDays"
  | "dischargeDestination"
  | "toastEtiology"
  | "symptomaticICH"
  | "mortality90d"
> & { createdAt?: string | null };

export const RETROSPECTIVE_KEYS: (keyof RetrospectiveFields)[] = [
  "age",
  "sex",
  "mrsBaseline",
  "mrsDischarge",
  "mrs90d",
  "lengthOfStayDays",
  "dischargeDestination",
  "toastEtiology",
  "symptomaticICH",
  "mortality90d",
];

// ── Etiquetas en español para la UI ────────────────────────────────────────────

export const DRUG_LABEL: Record<Drug, string> = {
  tnk: "TNK",
  rtpa: "rtPA",
};

export const SOURCE_LABEL: Record<CaseSource, string> = {
  app: "App",
  sheets_import: "Sheets",
  manual: "Manual",
};

export const DESTINATION_LABEL: Record<DischargeDestination, string> = {
  home: "Domicilio",
  rehab: "Rehabilitación",
  other_facility: "Otra institución",
  death: "Óbito",
};

export const TOAST_LABEL: Record<ToastEtiology, string> = {
  laa: "Aterotrombótico",
  cardioembolic: "Cardioembólico",
  lacunar: "Lacunar",
  other: "Otra causa",
  undetermined: "Indeterminado",
};

/** Abreviaturas TOAST para tablas densas. */
export const TOAST_SHORT: Record<ToastEtiology, string> = {
  laa: "LAA",
  cardioembolic: "CE",
  lacunar: "Lacunar",
  other: "Otra",
  undetermined: "Indet.",
};

export const LVO_SITE_LABEL: Record<LvoSite, string> = {
  ica: "Carótida interna (ACI)",
  m1: "ACM M1",
  m2: "ACM M2",
  aca: "Cerebral anterior (ACA)",
  pca: "Cerebral posterior (ACP)",
  basilar: "Basilar",
  tandem: "Tándem",
};

/** Abreviaturas de sitio OGV para tablas densas. */
export const LVO_SITE_SHORT: Record<LvoSite, string> = {
  ica: "ACI",
  m1: "M1",
  m2: "M2",
  aca: "ACA",
  pca: "ACP",
  basilar: "Basilar",
  tandem: "Tándem",
};

export const MRS_LABEL: Record<MrsScore, string> = {
  0: "0 · Sin síntomas",
  1: "1 · Sin discapacidad significativa",
  2: "2 · Discapacidad leve",
  3: "3 · Discapacidad moderada",
  4: "4 · Discapacidad moderada-grave",
  5: "5 · Discapacidad grave",
  6: "6 · Muerte",
};

// ── Derivados (origen B) ───────────────────────────────────────────────────────

function diffMinutes(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const ms = new Date(a).getTime() - new Date(b).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;
  return Math.round(ms / 60000);
}

export interface DerivedTimes {
  doorToNeedleMin: number | null; // puerta-aguja
  onsetToNeedleMin: number | null; // inicio-aguja
  doorToCtMin: number | null; // puerta-TC
  doorToGroinMin: number | null; // puerta-punción (trombectomía)
}

/** Calcula los intervalos a partir de los timestamps. Única fuente del DTN. */
export function deriveTimes(c: StrokeCase): DerivedTimes {
  return {
    doorToNeedleMin: diffMinutes(c.thrombolyticStart, c.doorTime),
    onsetToNeedleMin: diffMinutes(c.thrombolyticStart, c.symptomOnset),
    doorToCtMin: diffMinutes(c.ctRequestTime, c.doorTime),
    doorToGroinMin: diffMinutes(c.thrombectomyActivation, c.doorTime),
  };
}

/** mRS favorable = 0-2 (independencia funcional). */
export function isFavorableMrs(score: MrsScore | null): boolean {
  return score !== null && score <= 2;
}
