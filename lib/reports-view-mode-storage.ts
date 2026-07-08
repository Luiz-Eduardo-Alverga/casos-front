import type { ReportsViewMode } from "@/components/reports/types";

const STORAGE_KEY = "@reports:view-mode";

const VALID_MODES: ReportsViewMode[] = ["cards", "split"];

export function readReportsViewMode(): ReportsViewMode | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return VALID_MODES.includes(raw as ReportsViewMode)
      ? (raw as ReportsViewMode)
      : null;
  } catch {
    return null;
  }
}

export function writeReportsViewMode(mode: ReportsViewMode): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage pode estar indisponível ou cheio.
  }
}
