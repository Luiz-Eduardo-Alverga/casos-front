import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  CasoAbertoPipApp,
  PIP_WINDOW_SIZES,
  setCasoAbertoPipInitialLayout,
  type CasoAbertoPipAppProps,
} from "@/components/caso-aberto-player/caso-aberto-pip-content";
import type {
  CasoAbertoPipLayout,
  DocumentPictureInPictureWindow,
} from "@/components/caso-aberto-player/types";

export type { DocumentPictureInPictureWindow, CasoAbertoPipLayout };

type DocumentPictureInPictureApi = {
  requestWindow: (options?: {
    width?: number;
    height?: number;
  }) => Promise<DocumentPictureInPictureWindow>;
};

type PipSession = {
  window: DocumentPictureInPictureWindow;
  root: Root;
};

let activeSession: PipSession | null = null;

function getDocumentPictureInPicture(): DocumentPictureInPictureApi | null {
  if (typeof window === "undefined") return null;
  const api = (
    window as Window & {
      documentPictureInPicture?: DocumentPictureInPictureApi;
    }
  ).documentPictureInPicture;
  return api ?? null;
}

export function isDocumentPictureInPictureSupported(): boolean {
  return getDocumentPictureInPicture() != null;
}

function copyStylesToPip(pipDocument: Document) {
  const source = getComputedStyle(document.documentElement);

  for (let i = 0; i < source.length; i += 1) {
    const name = source.item(i);
    if (!name.startsWith("--")) continue;
    const value = source.getPropertyValue(name).trim();
    if (!value) continue;
    pipDocument.documentElement.style.setProperty(name, value);
  }

  if (document.documentElement.classList.contains("dark")) {
    pipDocument.documentElement.classList.add("dark");
  }

  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    pipDocument.head.appendChild(node.cloneNode(true));
  });

  const baseStyle = pipDocument.createElement("style");
  baseStyle.textContent = `
    html, body, #caso-aberto-pip-root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
    }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      -webkit-font-smoothing: antialiased;
      color: hsl(var(--foreground));
    }
  `;
  pipDocument.head.appendChild(baseStyle);
}

function clearActiveSession() {
  if (!activeSession) return;

  try {
    activeSession.root.unmount();
  } catch {
    // ignore unmount errors when window already closed
  }

  activeSession = null;
}

export function unmountCasoAbertoPip() {
  const session = activeSession;
  clearActiveSession();

  if (session && !session.window.closed) {
    session.window.close();
  }
}

export function renderCasoAbertoPip(
  pipWindow: DocumentPictureInPictureWindow,
  props: Omit<CasoAbertoPipAppProps, "pipWindow">,
) {
  if (!activeSession || activeSession.window !== pipWindow) {
    clearActiveSession();

    let container = pipWindow.document.getElementById("caso-aberto-pip-root");
    if (!container) {
      container = pipWindow.document.createElement("div");
      container.id = "caso-aberto-pip-root";
      pipWindow.document.body.replaceChildren(container);
    }

    activeSession = {
      window: pipWindow,
      root: createRoot(container),
    };
  }

  activeSession.root.render(
    createElement(CasoAbertoPipApp, {
      ...props,
      pipWindow,
    }),
  );
}

export async function openCasoAbertoPipWindow(
  layout: CasoAbertoPipLayout = "expanded",
): Promise<DocumentPictureInPictureWindow> {
  const api = getDocumentPictureInPicture();
  if (!api) {
    throw new Error("Picture-in-Picture não é suportado neste navegador.");
  }

  unmountCasoAbertoPip();
  setCasoAbertoPipInitialLayout(layout);

  const size = PIP_WINDOW_SIZES[layout];
  const pipWindow = await api.requestWindow({
    width: size.width,
    height: size.height,
  });

  copyStylesToPip(pipWindow.document);

  pipWindow.addEventListener("pagehide", () => {
    if (activeSession?.window === pipWindow) {
      clearActiveSession();
    }
  });

  return pipWindow;
}
