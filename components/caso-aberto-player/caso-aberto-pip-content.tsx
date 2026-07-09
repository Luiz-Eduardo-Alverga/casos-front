"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Copy,
  Eye,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CasoAbertoCronometro } from "@/components/caso-aberto-player/caso-aberto-cronometro";
import { CasoAbertoProgressTrack } from "@/components/caso-aberto-player/caso-aberto-progress-track";
import {
  PulseContainer,
  PulseRing,
} from "@/components/caso-aberto-player/pulse-ring";
import type {
  CasoAbertoPipLayout,
  CasoAbertoPlayerViewModel,
  DocumentPictureInPictureWindow,
} from "@/components/caso-aberto-player/types";
import { cn } from "@/lib/utils";

export type { CasoAbertoPipLayout };

export const PIP_WINDOW_SIZES: Record<
  CasoAbertoPipLayout,
  { width: number; height: number }
> = {
  collapsed: { width: 360, height: 72 },
  expanded: { width: 400, height: 450 },
};

export interface CasoAbertoPipAppProps {
  viewModel: CasoAbertoPlayerViewModel;
  pipWindow: DocumentPictureInPictureWindow;
  initialLayout?: CasoAbertoPipLayout;
  onParar: () => void;
  onVerCaso: () => void;
  onFinalizarCaso: () => void;
  onCopiarCommit: () => void;
  onCopiarTextoCompleto: () => void;
  isParando: boolean;
  isFinalizando: boolean;
}

function resizePipWindow(
  pipWindow: DocumentPictureInPictureWindow,
  layout: CasoAbertoPipLayout,
) {
  const size = PIP_WINDOW_SIZES[layout];
  try {
    pipWindow.resizeTo(size.width, size.height);
  } catch {
    // Alguns browsers restringem resizeTo em Document PiP.
  }
}

function PipCollapsed({
  viewModel,
  onExpand,
}: {
  viewModel: CasoAbertoPlayerViewModel;
  onExpand: () => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-transparent p-2">
      <PulseContainer enabled className="w-full rounded-full">
        <div
          className={cn(
            "flex w-full items-center rounded-full border border-emerald-500/30",
            "bg-card py-2.5 pl-2 pr-3 shadow-lg",
          )}
        >
          <button
            type="button"
            onClick={onExpand}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 transition-colors hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            )}
            aria-label={`Caso ${viewModel.casoId} em produção. Clique para expandir.`}
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
              <CirclePlay
                className="size-5 fill-emerald-500 text-white"
                aria-hidden
              />
            </span>

            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-bold text-foreground">
                Caso #{viewModel.casoId}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {viewModel.produtoNome}
              </span>
            </span>

            <ChevronUp
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </button>
        </div>
      </PulseContainer>
    </div>
  );
}

function PipActionsMenu({
  onCopiarCommit,
  onCopiarTextoCompleto,
}: {
  onCopiarCommit: () => void;
  onCopiarTextoCompleto: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Mais ações"
        aria-expanded={open}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </button>
      {open ? (
        <div className="absolute right-0 top-9 z-20 w-56 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
          <button
            type="button"
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onCopiarCommit();
              setOpen(false);
            }}
          >
            <Copy className="mr-2 size-4" aria-hidden />
            Copiar formato commit
          </button>
          <button
            type="button"
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onCopiarTextoCompleto();
              setOpen(false);
            }}
          >
            <FileText className="mr-2 size-4" aria-hidden />
            Copiar todo o texto
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PipExpanded({
  viewModel,
  onCollapse,
  onParar,
  onVerCaso,
  onFinalizarCaso,
  onCopiarCommit,
  onCopiarTextoCompleto,
  isParando,
  isFinalizando,
}: {
  viewModel: CasoAbertoPlayerViewModel;
  onCollapse: () => void;
  onParar: () => void;
  onVerCaso: () => void;
  onFinalizarCaso: () => void;
  onCopiarCommit: () => void;
  onCopiarTextoCompleto: () => void;
  isParando: boolean;
  isFinalizando: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl border border-border-divider",
        "bg-card shadow-2xl",
      )}
    >
      <div className="flex items-center justify-between border-b border-border-divider px-2 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
          <PulseRing size="sm" />
          <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">
            Produção ativa
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <PipActionsMenu
            onCopiarCommit={onCopiarCommit}
            onCopiarTextoCompleto={onCopiarTextoCompleto}
          />
          <button
            type="button"
            onClick={onCollapse}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Minimizar Picture-in-Picture"
          >
            <ChevronDown className="size-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 py-4">
        <div className="flex items-start gap-2">
          <h2 className="min-w-0 flex-1 text-sm font-bold leading-snug text-foreground">
            {viewModel.titleLine}
          </h2>
          {viewModel.prioridadeBadge ? (
            <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {viewModel.prioridadeBadge}
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {viewModel.pathDescription}
        </p>

        <CasoAbertoProgressTrack
          percent={viewModel.progressPercent}
          realizadoMinutos={viewModel.realizadoMinutos}
          estimadoMinutos={viewModel.estimadoMinutos}
        />

        <CasoAbertoCronometro
          horaAberturaIso={viewModel.horaAberturaIso}
          onParar={onParar}
          isParando={isParando}
        />
      </div>

      <div className="space-y-2 border-t border-border-divider px-4 py-3">
        <p className="text-[11px] leading-snug text-muted-foreground">
          Para <span className="font-medium text-foreground">Ver caso</span> e{" "}
          <span className="font-medium text-foreground">Finalizar</span>, a
          janela principal do navegador será aberta para concluir a ação.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            className="h-10 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onVerCaso}
          >
            <Eye className="mr-2 size-4" aria-hidden />
            Ver caso
          </Button>
          <Button
            type="button"
            className="h-10 flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={onFinalizarCaso}
            disabled={isFinalizando || isParando}
          >
            <CheckCircle2 className="mr-2 size-4" aria-hidden />
            {isFinalizando ? "Finalizando..." : "Finalizar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

let persistedPipLayout: CasoAbertoPipLayout = "expanded";

export function setCasoAbertoPipInitialLayout(layout: CasoAbertoPipLayout) {
  persistedPipLayout = layout;
}

export function CasoAbertoPipApp({
  viewModel,
  pipWindow,
  initialLayout = "expanded",
  onParar,
  onVerCaso,
  onFinalizarCaso,
  onCopiarCommit,
  onCopiarTextoCompleto,
  isParando,
  isFinalizando,
}: CasoAbertoPipAppProps) {
  const [layout, setLayout] = useState<CasoAbertoPipLayout>(
    () => initialLayout || persistedPipLayout,
  );

  useEffect(() => {
    persistedPipLayout = layout;
    resizePipWindow(pipWindow, layout);
  }, [layout, pipWindow]);

  const handleExpand = () => setLayout("expanded");
  const handleCollapse = () => setLayout("collapsed");

  if (layout === "collapsed") {
    return <PipCollapsed viewModel={viewModel} onExpand={handleExpand} />;
  }

  return (
    <PipExpanded
      viewModel={viewModel}
      onCollapse={handleCollapse}
      onParar={onParar}
      onVerCaso={onVerCaso}
      onFinalizarCaso={onFinalizarCaso}
      onCopiarCommit={onCopiarCommit}
      onCopiarTextoCompleto={onCopiarTextoCompleto}
      isParando={isParando}
      isFinalizando={isFinalizando}
    />
  );
}
