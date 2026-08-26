export type MelhoriaDecision = "SIM" | "NÃO";

export function normalizeMelhoriaStatus(
  value: string | null | undefined,
): string {
  return (value ?? "").trim();
}

export function isMelhoriaPendente(
  status: string | null | undefined,
): boolean {
  return normalizeMelhoriaStatus(status) === "";
}

export function isMelhoriaAprovada(
  status: string | null | undefined,
): boolean {
  return normalizeMelhoriaStatus(status).toUpperCase() === "SIM";
}

export function isMelhoriaRecusada(
  status: string | null | undefined,
): boolean {
  const normalized = normalizeMelhoriaStatus(status).toUpperCase();
  return normalized === "NÃO" || normalized === "NAO";
}

export function isMelhoriaConcluida(
  concluido: string | null | undefined,
): boolean {
  return (concluido ?? "").trim().toLowerCase() === "sim";
}

export function toMelhoriaDecision(
  status: string | null | undefined,
): MelhoriaDecision | null {
  if (isMelhoriaAprovada(status)) return "SIM";
  if (isMelhoriaRecusada(status)) return "NÃO";
  return null;
}
