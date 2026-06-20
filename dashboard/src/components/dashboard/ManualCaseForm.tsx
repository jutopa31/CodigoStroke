"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualCase } from "@/lib/actions";
import {
  type ManualCaseInput,
  type MrsScore,
  type Sex,
  type Drug,
  type LvoSite,
  type DischargeDestination,
  type ToastEtiology,
  MRS_LABEL,
  DESTINATION_LABEL,
  TOAST_LABEL,
  LVO_SITE_LABEL,
} from "@/lib/types";

const labelCls = "block text-[11px] font-semibold text-[#334155] uppercase tracking-wide mb-1";
const fieldCls =
  "w-full rounded-lg border border-[#F0F0F0] bg-white px-3 py-2 text-sm text-[#132B58] outline-none focus:border-[#244B99] transition";

// Mismo flag que el resto del dashboard: mock por defecto, salvo USE_MOCK="false".
const IS_DEMO = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

function numOrNull(v: string): number | null {
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function boolOrNull(v: string): boolean | null {
  return v === "" ? null : v === "true";
}

function isoOrNull(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Estado del form: strings de los <input>/<select>, se convierten al enviar.
interface FormState {
  patientAlias: string;
  caseDate: string; // YYYY-MM-DD
  age: string;
  sex: string;
  nihssScore: string;
  aspectsScore: string;
  isWakeUpStroke: string;
  hasLvo: string;
  lvoSite: string;
  symptomOnset: string; // datetime-local
  doorTime: string; // datetime-local
  thrombolysisGiven: string;
  drugUsed: string;
  thrombectomyDone: string;
  hasBleeding: string;
  mrsBaseline: string;
  mrsDischarge: string;
  mrs90d: string;
  lengthOfStayDays: string;
  dischargeDestination: string;
  toastEtiology: string;
  symptomaticICH: string;
  mortality90d: string;
}

const EMPTY: FormState = {
  patientAlias: "",
  caseDate: new Date().toISOString().slice(0, 10),
  age: "",
  sex: "",
  nihssScore: "",
  aspectsScore: "",
  isWakeUpStroke: "",
  hasLvo: "",
  lvoSite: "",
  symptomOnset: "",
  doorTime: "",
  thrombolysisGiven: "",
  drugUsed: "",
  thrombectomyDone: "",
  hasBleeding: "",
  mrsBaseline: "",
  mrsDischarge: "",
  mrs90d: "",
  lengthOfStayDays: "",
  dischargeDestination: "",
  toastEtiology: "",
  symptomaticICH: "",
  mortality90d: "",
};

const TABS = ["Demografía", "Presentación", "Tiempos", "Tratamiento", "Outcomes"] as const;

const mrsScoreOrNull = (v: string): MrsScore | null =>
  v === "" ? null : (Number(v) as MrsScore);

function toInput(f: FormState): ManualCaseInput {
  return {
    patientAlias: f.patientAlias.trim() || null,
    // Mediodía local: una fecha date-only a medianoche UTC se mostraría un día
    // antes en husos negativos (AR = UTC-3). El mediodía evita el corrimiento.
    createdAt: f.caseDate ? new Date(`${f.caseDate}T12:00:00`).toISOString() : null,
    age: numOrNull(f.age),
    sex: (f.sex || null) as Sex | null,
    nihssScore: numOrNull(f.nihssScore),
    aspectsScore: numOrNull(f.aspectsScore),
    isWakeUpStroke: boolOrNull(f.isWakeUpStroke),
    hasLvo: boolOrNull(f.hasLvo),
    lvoSite: (f.lvoSite || null) as LvoSite | null,
    symptomOnset: isoOrNull(f.symptomOnset),
    doorTime: isoOrNull(f.doorTime),
    thrombolysisGiven: boolOrNull(f.thrombolysisGiven),
    drugUsed: (f.drugUsed || null) as Drug | null,
    thrombectomyDone: boolOrNull(f.thrombectomyDone),
    hasBleeding: boolOrNull(f.hasBleeding),
    mrsBaseline: mrsScoreOrNull(f.mrsBaseline),
    mrsDischarge: mrsScoreOrNull(f.mrsDischarge),
    mrs90d: mrsScoreOrNull(f.mrs90d),
    lengthOfStayDays: numOrNull(f.lengthOfStayDays),
    dischargeDestination: (f.dischargeDestination || null) as DischargeDestination | null,
    toastEtiology: (f.toastEtiology || null) as ToastEtiology | null,
    symptomaticICH: boolOrNull(f.symptomaticICH),
    mortality90d: boolOrNull(f.mortality90d),
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function YesNo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls}>
      <option value="">—</option>
      <option value="false">No</option>
      <option value="true">Sí</option>
    </select>
  );
}

export default function ManualCaseForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [tab, setTab] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function set<K extends keyof FormState>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const mrsOptions = ([0, 1, 2, 3, 4, 5, 6] as MrsScore[]).map((s) => (
    <option key={s} value={s}>
      {MRS_LABEL[s]}
    </option>
  ));

  const isLast = tab === TABS.length - 1;

  function handleCreate() {
    setError(false);
    startTransition(async () => {
      const res = await createManualCase(toInput(form));
      if (res.ok) {
        router.push("/dashboard/casos");
        router.refresh();
      } else {
        setError(true);
      }
    });
  }

  return (
    <div className="rounded-xl border border-[#F0F0F0] bg-white p-4 sm:p-5">
      {IS_DEMO && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#F5C97A] bg-[#FEF6E7] px-3 py-2 text-[13px] text-[#8A5A00]">
          <span aria-hidden className="mt-px">ⓘ</span>
          <span>
            <strong>No activa el código stroke.</strong> Se guarda como caso de
            fuente <strong>Manual</strong>. En modo demo no persiste entre reinicios.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E6EE] mb-5 overflow-x-auto">
        {TABS.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(i)}
            className={`whitespace-nowrap px-3 py-2 text-[13px] border-b-2 -mb-px transition ${
              i === tab
                ? "border-[#132B58] text-[#132B58] font-semibold"
                : "border-transparent text-[#64748B] hover:text-[#132B58]"
            }`}
          >
            {i < tab && <span className="text-emerald-600 mr-1">✓</span>}
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0 — Demografía */}
      {tab === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <Field label="Alias / ID (opcional)">
              <input value={form.patientAlias} onChange={(e) => set("patientAlias", e.target.value)} placeholder="GJ678" className={fieldCls} />
            </Field>
          </div>
          <Field label="Fecha del caso">
            <input type="date" value={form.caseDate} max={EMPTY.caseDate} onChange={(e) => set("caseDate", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Edad">
            <input type="number" min={0} max={120} value={form.age} onChange={(e) => set("age", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Sexo">
            <select value={form.sex} onChange={(e) => set("sex", e.target.value)} className={fieldCls}>
              <option value="">—</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </Field>
        </div>
      )}

      {/* Tab 1 — Presentación */}
      {tab === 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="NIHSS">
            <input type="number" min={0} max={42} value={form.nihssScore} onChange={(e) => set("nihssScore", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="ASPECTS">
            <input type="number" min={0} max={10} value={form.aspectsScore} onChange={(e) => set("aspectsScore", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Wake-up stroke">
            <YesNo value={form.isWakeUpStroke} onChange={(v) => set("isWakeUpStroke", v)} />
          </Field>
          <Field label="OGV (gran vaso)">
            <YesNo value={form.hasLvo} onChange={(v) => set("hasLvo", v)} />
          </Field>
          <div className="col-span-2">
            <Field label="Sitio de oclusión">
              <select value={form.lvoSite} onChange={(e) => set("lvoSite", e.target.value)} className={fieldCls} disabled={form.hasLvo !== "true"}>
                <option value="">—</option>
                {(Object.keys(LVO_SITE_LABEL) as LvoSite[]).map((k) => (
                  <option key={k} value={k}>{LVO_SITE_LABEL[k]}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* Tab 2 — Tiempos */}
      {tab === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Inicio / última vez visto">
            <input type="datetime-local" value={form.symptomOnset} onChange={(e) => set("symptomOnset", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Arribo a puerta">
            <input type="datetime-local" value={form.doorTime} onChange={(e) => set("doorTime", e.target.value)} className={fieldCls} />
          </Field>
        </div>
      )}

      {/* Tab 3 — Tratamiento */}
      {tab === 3 && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Trombólisis">
            <YesNo value={form.thrombolysisGiven} onChange={(v) => set("thrombolysisGiven", v)} />
          </Field>
          <Field label="Droga">
            <select value={form.drugUsed} onChange={(e) => set("drugUsed", e.target.value)} className={fieldCls}>
              <option value="">—</option>
              <option value="tnk">TNK</option>
              <option value="rtpa">rtPA</option>
            </select>
          </Field>
          <Field label="Trombectomía">
            <YesNo value={form.thrombectomyDone} onChange={(v) => set("thrombectomyDone", v)} />
          </Field>
          <Field label="Hemorragia en TC inicial">
            <YesNo value={form.hasBleeding} onChange={(v) => set("hasBleeding", v)} />
          </Field>
        </div>
      )}

      {/* Tab 4 — Outcomes */}
      {tab === 4 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="mRS basal">
            <select value={form.mrsBaseline} onChange={(e) => set("mrsBaseline", e.target.value)} className={fieldCls}>
              <option value="">—</option>{mrsOptions}
            </select>
          </Field>
          <Field label="mRS al alta">
            <select value={form.mrsDischarge} onChange={(e) => set("mrsDischarge", e.target.value)} className={fieldCls}>
              <option value="">—</option>{mrsOptions}
            </select>
          </Field>
          <Field label="mRS 90 días">
            <select value={form.mrs90d} onChange={(e) => set("mrs90d", e.target.value)} className={fieldCls}>
              <option value="">—</option>{mrsOptions}
            </select>
          </Field>
          <Field label="Días de internación">
            <input type="number" min={0} value={form.lengthOfStayDays} onChange={(e) => set("lengthOfStayDays", e.target.value)} className={fieldCls} />
          </Field>
          <Field label="Destino al alta">
            <select value={form.dischargeDestination} onChange={(e) => set("dischargeDestination", e.target.value)} className={fieldCls}>
              <option value="">—</option>
              {(Object.keys(DESTINATION_LABEL) as DischargeDestination[]).map((k) => (
                <option key={k} value={k}>{DESTINATION_LABEL[k]}</option>
              ))}
            </select>
          </Field>
          <Field label="Etiología (TOAST)">
            <select value={form.toastEtiology} onChange={(e) => set("toastEtiology", e.target.value)} className={fieldCls}>
              <option value="">—</option>
              {(Object.keys(TOAST_LABEL) as ToastEtiology[]).map((k) => (
                <option key={k} value={k}>{TOAST_LABEL[k]}</option>
              ))}
            </select>
          </Field>
          <Field label="sICH (hemorragia sintomática)">
            <YesNo value={form.symptomaticICH} onChange={(v) => set("symptomaticICH", v)} />
          </Field>
          <Field label="Mortalidad 90 días">
            <YesNo value={form.mortality90d} onChange={(v) => set("mortality90d", v)} />
          </Field>
        </div>
      )}

      {/* Footer nav */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setTab((t) => Math.max(0, t - 1))}
          disabled={tab === 0}
          className="px-3 py-2 text-sm text-[#334155] hover:text-[#132B58] disabled:opacity-40 transition-colors"
        >
          ‹ Atrás
        </button>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-[#DC2626]">No se pudo guardar</span>}
          <span className="text-xs text-[#64748B]">Paso {tab + 1} de {TABS.length}</span>
          {isLast ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={pending}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#132B58] text-white hover:bg-[#10264F] disabled:opacity-60 transition-colors"
            >
              {pending ? "Creando…" : "Crear caso"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setTab((t) => Math.min(TABS.length - 1, t + 1))}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#132B58] text-white hover:bg-[#10264F] transition-colors"
            >
              Siguiente ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
