// Overrides en memoria para las ediciones retrospectivas en modo mock.
// Persisten durante la vida del proceso del server (suficiente para la demo).
// En modo real, las ediciones van a Supabase vía UPDATE (ver actions.ts).

import type { RetrospectiveFields } from "./types";

const overrides = new Map<string, Partial<RetrospectiveFields>>();

export function getOverride(id: string): Partial<RetrospectiveFields> | undefined {
  return overrides.get(id);
}

export function setOverride(id: string, patch: Partial<RetrospectiveFields>): void {
  overrides.set(id, { ...overrides.get(id), ...patch });
}
