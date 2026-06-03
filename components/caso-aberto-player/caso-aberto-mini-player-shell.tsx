"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  MiniPlayerShellProvider,
  type MiniPlayerExpandDirection,
} from "@/components/caso-aberto-player/mini-player-shell-context";
import {
  getCasoAbertoMiniPlayerPosition,
  setCasoAbertoMiniPlayerPosition,
} from "@/lib/caso-aberto-mini-player-position-storage";

const MARGIN = 16;

function clampPosition(x: number, y: number, width: number, height: number) {
  return {
    x: Math.min(Math.max(MARGIN, x), window.innerWidth - width - MARGIN),
    y: Math.min(Math.max(MARGIN, y), window.innerHeight - height - MARGIN),
  };
}

function getDefaultPosition(width: number, height: number) {
  const isLg = window.innerWidth >= 1024;
  if (isLg) {
    return {
      x: window.innerWidth - width - 24,
      y: window.innerHeight - height - 24,
    };
  }
  return {
    x: (window.innerWidth - width) / 2,
    y: window.innerHeight - height - 24,
  };
}

function resolveExpandDirection(
  topY: number,
  height: number,
): MiniPlayerExpandDirection {
  const spaceBelow = window.innerHeight - (topY + height);
  const spaceAbove = topY;
  return spaceBelow >= spaceAbove ? "down" : "up";
}

function shouldAnchorBottom(topY: number, height: number) {
  return resolveExpandDirection(topY, height) === "up";
}

function shouldAnchorRight(leftX: number, width: number) {
  const spaceRight = window.innerWidth - (leftX + width);
  const spaceLeft = leftX;
  return spaceRight < spaceLeft;
}

interface CasoAbertoMiniPlayerShellProps {
  children: React.ReactNode;
}

export function CasoAbertoMiniPlayerShell({
  children,
}: CasoAbertoMiniPlayerShellProps) {
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const shellRef = useRef<HTMLDivElement>(null);
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [ready, setReady] = useState(false);
  const [expandDirection, setExpandDirection] =
    useState<MiniPlayerExpandDirection>("up");

  const syncPosition = useCallback(
    (persist = false) => {
      const el = shellRef.current;
      if (!el) return;

      const { width, height } = el.getBoundingClientRect();
      const prev = prevSizeRef.current;

      if (prev.height > 0 && height !== prev.height) {
        if (shouldAnchorBottom(y.get(), prev.height)) {
          const bottom = y.get() + prev.height;
          y.set(bottom - height);
        }
      }

      if (prev.width > 0 && width !== prev.width) {
        if (shouldAnchorRight(x.get(), prev.width)) {
          const right = x.get() + prev.width;
          x.set(right - width);
        }
      }

      const clamped = clampPosition(x.get(), y.get(), width, height);
      x.set(clamped.x);
      y.set(clamped.y);
      setExpandDirection(resolveExpandDirection(clamped.y, height));

      if (persist) {
        setCasoAbertoMiniPlayerPosition(clamped);
      }

      prevSizeRef.current = { width, height };
    },
    [x, y],
  );

  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const { width, height } = el.getBoundingClientRect();
    const saved = getCasoAbertoMiniPlayerPosition();
    const initial = saved ?? getDefaultPosition(width, height);
    const clamped = clampPosition(initial.x, initial.y, width, height);

    x.set(clamped.x);
    y.set(clamped.y);
    setExpandDirection(resolveExpandDirection(clamped.y, height));
    prevSizeRef.current = { width, height };
    setReady(true);
  }, [x, y]);

  useEffect(() => {
    const el = shellRef.current;
    if (!el || !ready) return;

    const observer = new ResizeObserver(() => {
      syncPosition(true);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready, syncPosition]);

  useEffect(() => {
    const handleResize = () => syncPosition(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [syncPosition]);

  const handleDragEnd = () => {
    syncPosition(true);
  };

  const handleStartDrag = (event: React.PointerEvent) => {
    dragControls.start(event);
  };

  return (
    <MiniPlayerShellProvider
      startDrag={handleStartDrag}
      expandDirection={expandDirection}
    >
      <motion.div
        ref={shellRef}
        role="region"
        aria-label="Caso em produção aberto"
        drag={!reduceMotion}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        style={{ x, y, opacity: ready ? 1 : 0 }}
        onDragEnd={handleDragEnd}
        className="fixed left-0 top-0 z-[60] touch-none"
      >
        {children}
      </motion.div>
    </MiniPlayerShellProvider>
  );
}
