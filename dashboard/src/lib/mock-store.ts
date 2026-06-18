// Estado en memoria para el modo mock. Persiste durante la vida del proceso
// del server (suficiente para la demo). En modo real las ediciones/altas van a
// Supabase vía UPDATE/INSERT (ver actions.ts).
//
//   overrides   → ediciones retrospectivas sobre casos existentes
//   manualCases → casos cargados manualmente desde el dashboard (source 'manual')

import type { RetrospectiveFields, StrokeCase } from "./types";

const overrides = new Map<string, Partial<RetrospectiveFields>>();

export function getOverride(id: string): Partial<RetrospectiveFields> | undefined {
  return overrides.get(id);
}

export function setOverride(id: string, patch: Partial<RetrospectiveFields>): void {
  overrides.set(id, { ...overrides.get(id), ...patch });
}

// ── Casos manuales (ACV evolucionado / carga retrospectiva) ───────────────────

const manualCases: StrokeCase[] = [];

export function addManualCase(c: StrokeCase): void {
  manualCases.unshift(c);
}

export function getManualCases(): StrokeCase[] {
  return manualCases;
}
