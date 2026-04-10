"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: SwaggerUIBundleCtor;
    SwaggerUIStandalonePreset?: unknown;
  }
}

type SwaggerUIBundleCtor = {
  (options: Record<string, unknown>): unknown;
  presets?: { apis: unknown };
};

/**
 * Swagger UI 5.x (OpenAPI 3.1) carregado via CDN — evita dependência local pesada (swagger-ui-react).
 */
export const SwaggerApiDocs = () => {
  const [bundleOk, setBundleOk] = useState(false);
  const [presetOk, setPresetOk] = useState(false);

  useEffect(() => {
    if (!bundleOk || !presetOk) return;
    const B = window.SwaggerUIBundle;
    const P = window.SwaggerUIStandalonePreset;
    if (!B || !P || !B.presets?.apis) return;

    const el = document.getElementById("swagger-ui");
    if (el) el.innerHTML = "";

    B({
      url: "/openapi.yaml",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [B.presets.apis, P],
      layout: "StandaloneLayout",
      requestInterceptor: (req: { credentials?: RequestCredentials }) => {
        const r = req;
        r.credentials = "include";
        return r;
      },
    });

    return () => {
      if (el) el.innerHTML = "";
    };
  }, [bundleOk, presetOk]);

  return (
    <>
      <Script
        src="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => setBundleOk(true)}
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
        onLoad={() => setPresetOk(true)}
      />
      <div className="min-h-screen bg-white">
        {/* <div className="border-b border-neutral-200 px-4 py-3 text-sm text-neutral-600">
          Autenticação: cookie{" "}
          <code className="rounded bg-neutral-100 px-1">casos_token</code>{" "}
          (login em{" "}
          <code className="rounded bg-neutral-100 px-1">POST /api/login</code>).
          No &quot;Try it out&quot;, requisições usam{" "}
          <code className="rounded bg-neutral-100 px-1">
            credentials: include
          </code>
          .
        </div> */}
        <div id="swagger-ui" />
      </div>
    </>
  );
};
