import type { CasoFlags } from "@/interfaces/projeto-memoria";

export function isCasoBloqueado(flags: CasoFlags | undefined): boolean {
  return flags?.bloqueado === true;
}
