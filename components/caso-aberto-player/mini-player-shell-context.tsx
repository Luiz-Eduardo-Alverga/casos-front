"use client";

import { createContext, useContext } from "react";

type StartDrag = (event: React.PointerEvent) => void;

export type MiniPlayerExpandDirection = "up" | "down";

interface MiniPlayerShellContextValue {
  startDrag: StartDrag;
  expandDirection: MiniPlayerExpandDirection;
}

const MiniPlayerShellContext = createContext<MiniPlayerShellContextValue | null>(
  null,
);

export function MiniPlayerShellProvider({
  startDrag,
  expandDirection,
  children,
}: {
  startDrag: StartDrag;
  expandDirection: MiniPlayerExpandDirection;
  children: React.ReactNode;
}) {
  return (
    <MiniPlayerShellContext.Provider value={{ startDrag, expandDirection }}>
      {children}
    </MiniPlayerShellContext.Provider>
  );
}

export function useMiniPlayerDragHandle(): StartDrag | null {
  return useContext(MiniPlayerShellContext)?.startDrag ?? null;
}

export function useMiniPlayerExpandDirection(): MiniPlayerExpandDirection {
  return useContext(MiniPlayerShellContext)?.expandDirection ?? "up";
}
