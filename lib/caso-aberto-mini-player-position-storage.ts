const LS_KEY = "caso-aberto-mini-player-position";

export type CasoAbertoMiniPlayerPosition = {
  x: number;
  y: number;
};

export function getCasoAbertoMiniPlayerPosition(): CasoAbertoMiniPlayerPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CasoAbertoMiniPlayerPosition;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCasoAbertoMiniPlayerPosition(
  position: CasoAbertoMiniPlayerPosition,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(position));
}
