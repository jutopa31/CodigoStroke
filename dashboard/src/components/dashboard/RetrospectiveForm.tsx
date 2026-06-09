"use client";

import { useState, useTransition } from "react";
import { saveRetrospective } from "@/lib/actions";
import {
  type StrokeCase,
  type RetrospectiveFields,
  type MrsScore,
  type Sex,
  type DischargeDestination,
  type ToastEtiology,
  MRS_LABEL,
  DESTINATION_LABEL,
  TOAST_LABEL,
} from "@/lib/types";

const labelCls = "block text-[11px] font-semibold text-[#A8B6D6] uppercase tracking-wide mb-1";
const fieldCls =
  "w-full rounded-lg border border-[#F0F0F0] bg-white px-3 py-2 text-sm text-[#132B58] outline-none focus:border-[#244B99] transition";

function numOrNull(v: string): number | null {
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function boolOrNull(v: string): boolean | null {
  return v === "" ? null : v === "true";
}

export default function RetrospectiveForm({ c }: { c: StrokeCase }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<RetrospectiveFields>({
    age: c.age,
    sex: c.sex,
    mrsBaseline: c.mrsBaseline,
    mrsDischarge: c.mrsDischarge,
    mrs90d: c.mrs90d,
    lengthOfStayDays: c.lengthOfStayDays,
    dischargeDestination: c.dischargeDestination,
    toastEtiology: c.toastEtiology,
    symptomaticICH: c.symptomaticICH,
    mortality90d: c.mortality90d,
  });

  function set<K extends keyof RetrospectiveFields>(k: K, v: RetrospectiveFields[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveRetrospective(c.id, form);
      if (res.ok) setSaved(true);
    });
  }

  const mrsOptions = ([0, 1, 2, 3, 4, 5, 6] as MrsScore[]).map((s) => (
    <option key={s} value={s}>
      {MRS_LABEL[s]}
    </option>
  ));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Edad</label>
          <input
            type="number"
            min={0}
            max={120}
            value={form.age ?? ""}
            onChange={(e) => set("age", numOrNull(e.target.value))}
            className={fieldCls}
          />
        </div>
        <div>
          <label className={labelCls}>Sexo</label>
          <select value={form.sex ?? ""} onChange={(e) => set("sex", (e.target.value || null) as Sex | null)} className={fieldCls}>
            <option value="">—</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Días de internación</label>
          <input
            type="number"
            min={0}
            value={form.lengthOfStayDays ?? ""}
            onChange={(e) => set("lengthOfStayDays", numOrNull(e.target.value))}
            className={fieldCls}
          />
        </div>

        <div>
          <label className={labelCls}>mRS basal</label>
          <select
            value={form.mrsBaseline ?? ""}
            onChange={(e) => set("mrsBaseline", e.target.value === "" ? null : (Number(e.target.value) as MrsScore))}
            className={fieldCls}
          >
            <option value="">—</option>
            {mrsOptions}
          </select>
        </div>
        <div>
          <label className={labelCls}>mRS al alta</label>
          <select
            value={form.mrsDischarge ?? ""}
            onChange={(e) => set("mrsDischarge", e.target.value === "" ? null : (Number(e.target.value) as MrsScore))}
            className={fieldCls}
          >
            <option value="">—</option>
            {mrsOptions}
          </select>
        </div>
        <div>
          <label className={labelCls}>mRS 90 días</label>
          <select
            value={form.mrs90d ?? ""}
            onChange={(e) => set("mrs90d", e.target.value === "" ? null : (Number(e.target.value) as MrsScore))}
            className={fieldCls}
          >
            <option value="">—</option>
            {mrsOptions}
          </select>
        </div>

        <div>
          <label className={labelCls}>Destino al alta</label>
          <select
            value={form.dischargeDestination ?? ""}
            onChange={(e) => set("dischargeDestination", (e.target.value || null) as DischargeDestination | null)}
            className={fieldCls}
          >
            <option value="">—</option>
            {(Object.keys(DESTINATION_LABEL) as DischargeDestination[]).map((k) => (
              <option key={k} value={k}>
                {DESTINATION_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Etiología (TOAST)</label>
          <select
            value={form.toastEtiology ?? ""}
            onChange={(e) => set("toastEtiology", (e.target.value || null) as ToastEtiology | null)}
            className={fieldCls}
          >
            <option value="">—</option>
            {(Object.keys(TOAST_LABEL) as ToastEtiology[]).map((k) => (
              <option key={k} value={k}>
                {TOAST_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>sICH (hemorragia sintomática)</label>
          <select value={form.symptomaticICH === null ? "" : String(form.symptomaticICH)} onChange={(e) => set("symptomaticICH", boolOrNull(e.target.value))} className={fieldCls}>
            <option value="">—</option>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Mortalidad 90 días</label>
          <select value={form.mortality90d === null ? "" : String(form.mortality90d)} onChange={(e) => set("mortality90d", boolOrNull(e.target.value))} className={fieldCls}>
            <option value="">—</option>
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[#132B58] text-white hover:bg-[#10264F] disabled:opacity-60 transition-colors"
        >
          {pending ? "Guardando…" : "Guardar outcomes"}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">✓ Guardado</span>}
      </div>
    </form>
  );
}
