type LottieRgb = [number, number, number];

/** Cor ciano original do BlueAlert.json */
export const BLUE_ALERT_SOURCE_COLOR: LottieRgb = [
  0.1803921568627451, 0.7764705882352941, 0.9019607843137255,
];

/** Cor roxa original do questionMarkBlue.json */
export const QUESTION_SOURCE_COLOR: LottieRgb = [
  0.1176, 0.0863, 0.2706,
];

export function parseHslCssVar(raw: string): [number, number, number] {
  const parts = raw.trim().split(/\s+/);
  const h = parseFloat(parts[0] ?? "0");
  const s = parseFloat(parts[1]?.replace("%", "") ?? "0");
  const l = parseFloat(parts[2]?.replace("%", "") ?? "0");
  return [h, s, l];
}

export function hslToLottieRgb(h: number, s: number, l: number): LottieRgb {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [r + m, g + m, b + m];
}

export function getPrimaryLottieColor(theme?: string | null): LottieRgb {
  if (typeof window === "undefined") {
    return theme === "dark"
      ? hslToLottieRgb(215, 25, 27)
      : hslToLottieRgb(223, 23, 15);
  }

  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--primary",
  );
  const [h, s, l] = parseHslCssVar(raw);
  return hslToLottieRgb(h, s, l);
}

export function remapLottieFillColor(
  animation: object,
  from: LottieRgb,
  to: LottieRgb,
  tolerance = 0.01,
): object {
  const json = JSON.parse(JSON.stringify(animation)) as object;

  const matches = (rgb: number[]) =>
    Math.abs(rgb[0] - from[0]) < tolerance &&
    Math.abs(rgb[1] - from[1]) < tolerance &&
    Math.abs(rgb[2] - from[2]) < tolerance;

  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const obj = node as Record<string, unknown>;
    const c = obj.c;

    if (c && typeof c === "object" && !Array.isArray(c)) {
      const color = c as { a?: number; k?: number[] };
      if (
        color.a === 0 &&
        Array.isArray(color.k) &&
        color.k.length >= 3 &&
        matches(color.k)
      ) {
        color.k = [to[0], to[1], to[2], color.k[3] ?? 1];
      }
    }

    Object.values(obj).forEach(walk);
  };

  walk(json);
  return json;
}

/** Remove camadas de fundo sólido (ex.: "BG" no SuccessCheck.json). */
export function removeLottieBackgroundLayers(animation: object): object {
  const json = JSON.parse(JSON.stringify(animation)) as {
    layers?: Array<{ nm?: string }>;
    meta?: Record<string, unknown>;
  };

  if (Array.isArray(json.layers)) {
    json.layers = json.layers.filter((layer) => layer.nm !== "BG");
  }

  if (json.meta && typeof json.meta === "object" && json.meta.tc) {
    json.meta.tc = "";
  }

  return json;
}

export function prepareModalLottieAnimation(
  animation: object,
  options?: {
    remapColor?: { from: LottieRgb; to: LottieRgb };
  },
): object {
  let data = removeLottieBackgroundLayers(animation);

  if (options?.remapColor) {
    data = remapLottieFillColor(
      data,
      options.remapColor.from,
      options.remapColor.to,
    );
  }

  return data;
}
