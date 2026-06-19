import type { FiltroResumoItem } from "@/lib/types/filtros-resumo";
import { filtrosResumoReadSchema } from "@/lib/validators/db/user-filtros-preferencias";

const STORAGE_KEY_PREFIX = "@casos:filtros-resumo:";

function storageKey(appUserId: string): string {
  return `${STORAGE_KEY_PREFIX}${appUserId}`;
}

export function readCasosFiltrosPreferencias(
  appUserId: string,
): FiltroResumoItem[] | null {
  if (typeof window === "undefined" || !appUserId.trim()) return null;

  try {
    const raw = localStorage.getItem(storageKey(appUserId));
    if (!raw) return null;
    const parsed = filtrosResumoReadSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function writeCasosFiltrosPreferencias(
  appUserId: string,
  filtros: FiltroResumoItem[],
): void {
  if (typeof window === "undefined" || !appUserId.trim()) return;

  try {
    localStorage.setItem(storageKey(appUserId), JSON.stringify(filtros));
  } catch {
    // Storage pode estar indisponível ou cheio.
  }
}

export function clearCasosFiltrosPreferencias(appUserId: string): void {
  if (typeof window === "undefined" || !appUserId.trim()) return;
  localStorage.removeItem(storageKey(appUserId));
}
