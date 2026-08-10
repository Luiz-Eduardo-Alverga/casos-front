"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Check,
  Circle,
  Copy,
  Cpu,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { LiberacaoCardHeader } from "@/components/liberacoes/liberacao-card-header";
import type {
  ReleaseNotesData,
  ReleaseNotesProgressEvent,
} from "@/lib/types/release-notes";
import { cn } from "@/lib/utils";

const MARKDOWN_PROSE_CLASS =
  "overflow-y-auto pr-1 text-[12.5px] leading-relaxed text-text-secondary [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-[14px] [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-1.5 [&_h3]:mt-2.5 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-1.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-2 [&_ul]:space-y-1";

interface DescricaoGeradaCardProps {
  generating: boolean;
  progress: ReleaseNotesProgressEvent | null;
  draftMarkdown: string;
  resultado: ReleaseNotesData | null;
  onGerar: () => void;
  gerarDisabled?: boolean;
}

const DEFAULT_STEP_TITLES = [
  "Leitura de tickets e metadados",
  "Extração e organização dos casos",
  "Resolução do prompt",
  "Redação do registro com IA",
  "Formatação e validação",
];

type StepStatus = "done" | "active" | "pending";

function buildSteps(progress: ReleaseNotesProgressEvent | null) {
  const totalSteps = progress?.totalSteps ?? DEFAULT_STEP_TITLES.length;
  const currentStep = progress?.step ?? 0;

  return Array.from({ length: totalSteps }, (_, index) => {
    const stepNumber = index + 1;
    const isCurrent = stepNumber === currentStep;
    const isDone =
      (currentStep > 0 && stepNumber < currentStep) ||
      (progress?.percent === 100 && stepNumber <= currentStep);
    const title =
      isCurrent && progress?.title
        ? progress.title
        : (DEFAULT_STEP_TITLES[index] ?? `Etapa ${stepNumber}`);

    let status: StepStatus = "pending";
    if (isDone) status = "done";
    else if (isCurrent) status = "active";

    return { stepNumber, title, status };
  });
}

function formatEta(ms: number | null): string | null {
  if (ms == null || !Number.isFinite(ms) || ms <= 0) return null;
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `~${seconds}s`;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `~${minutes}min`;
}

function statusLabel(status: StepStatus) {
  if (status === "done") return "Concluído";
  if (status === "active") return "Processando";
  return "Aguardando";
}

function GerandoDescricaoProgress({
  progress,
  draftMarkdown,
}: {
  progress: ReleaseNotesProgressEvent | null;
  draftMarkdown: string;
}) {
  const steps = buildSteps(progress);
  const percent = Math.min(100, Math.max(0, progress?.percent ?? 0));
  const startedAtRef = useRef<number>(Date.now());
  const draftScrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    startedAtRef.current = Date.now();
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = draftScrollRef.current;
    if (!el || !draftMarkdown) return;
    el.scrollTop = el.scrollHeight;
  }, [draftMarkdown]);

  const etaLabel = useMemo(() => {
    if (percent <= 5 || percent >= 100) return null;
    const elapsed = now - startedAtRef.current;
    const remaining = (elapsed * (100 - percent)) / percent;
    return formatEta(remaining);
  }, [now, percent]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-white shadow-sm">
              <Cpu className="h-3.5 w-3.5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-violet-400" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Processando IA
            </span>
          </div>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {Math.round(percent)}%
          </span>
        </div>

        <div className="mb-3 space-y-1">
          <p className="flex items-start gap-1.5 text-[13px] font-semibold leading-snug text-foreground">
            <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {progress?.title ?? "Iniciando geração do registro..."}
            </span>
          </p>
          <p className="pl-5 text-[12px] leading-relaxed text-text-secondary">
            {progress?.detail ??
              "Conectando ao assistente e preparando o registro de liberação..."}
          </p>
          {typeof progress?.totalCasos === "number" ? (
            <p className="pl-5 text-[11.5px] text-text-secondary">
              <span className="font-medium text-foreground">Casos:</span>{" "}
              {progress.totalCasos}
            </p>
          ) : null}
        </div>

        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-fuchsia-400 transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 text-[11.5px] text-text-secondary">
          <span>
            Etapa {progress?.step ?? 0} de{" "}
            {progress?.totalSteps ?? DEFAULT_STEP_TITLES.length}
          </span>
          <span>
            {etaLabel ? `Tempo estimado: ${etaLabel}` : "Calculando tempo..."}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
          Fluxo de síntese inteligente
        </p>
        <ul className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.stepNumber}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[12.5px] transition-colors",
                step.status === "done" &&
                  "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
                step.status === "active" &&
                  "border-primary/50 bg-primary/5 text-primary",
                step.status === "pending" &&
                  "border-border bg-transparent text-muted-foreground",
              )}
            >
              {step.status === "done" ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-3 w-3" />
                </span>
              ) : step.status === "active" ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </span>
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <Circle className="h-3.5 w-3.5 opacity-50" />
                </span>
              )}

              <span
                className={cn(
                  "min-w-0 flex-1 leading-snug",
                  step.status === "active" && "font-medium",
                  step.status === "done" && "font-medium",
                )}
              >
                {step.stepNumber}. {step.title}
              </span>

              <span
                className={cn(
                  "shrink-0 text-[11.5px]",
                  step.status === "pending" && "opacity-70",
                )}
              >
                {statusLabel(step.status)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {draftMarkdown.length > 0 ? (
        <div className="space-y-2">
          <p className="px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            Prévia do registro
          </p>
          <div
            ref={draftScrollRef}
            className={cn(
              MARKDOWN_PROSE_CLASS,
              "max-h-[min(50vh,420px)] rounded-xl border border-border bg-muted/20 p-3",
            )}
          >
            <ReactMarkdown>{draftMarkdown}</ReactMarkdown>
            <span
              aria-hidden
              className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-primary align-baseline"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DescricaoGeradaCard({
  generating,
  progress,
  draftMarkdown,
  resultado,
  onGerar,
  gerarDisabled = false,
}: DescricaoGeradaCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!resultado?.registro_liberacao) return;
    try {
      await navigator.clipboard.writeText(resultado.registro_liberacao);
      setCopied(true);
      toast.success("Markdown copiado.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o texto.");
    }
  };

  const gerarButton = (
    <Button
      type="button"
      size="sm"
      disabled={generating || gerarDisabled}
      onClick={onGerar}
      className="bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90 disabled:opacity-50"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {resultado != null ? "Gerar novamente" : "Gerar descrição com IA"}
    </Button>
  );

  return (
    <div className="sticky top-0 self-start">
      <Card className="min-h-screen rounded-lg bg-card shadow-card">
        <LiberacaoCardHeader
          icon={Sparkles}
          title="Descrição gerada"
          right={
            resultado != null && !generating ? gerarButton : undefined
          }
        />
        <CardContent className="p-6 pt-2">
          {generating ? (
            <GerandoDescricaoProgress
              progress={progress}
              draftMarkdown={draftMarkdown}
            />
          ) : resultado != null ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 text-[11.5px] text-text-secondary">
                  {resultado.produto ? (
                    <p>
                      <span className="font-medium text-foreground">
                        Produto:
                      </span>{" "}
                      {resultado.produto}
                    </p>
                  ) : null}
                  {resultado.versoes?.length > 0 ? (
                    <p>
                      <span className="font-medium text-foreground">
                        Versões:
                      </span>{" "}
                      {resultado.versoes.join(", ")}
                    </p>
                  ) : null}
                  {typeof resultado.total_casos === "number" ? (
                    <p>
                      <span className="font-medium text-foreground">
                        Casos:
                      </span>{" "}
                      {resultado.total_casos}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleCopy()}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copiar
                </Button>
              </div>
              <div className={MARKDOWN_PROSE_CLASS}>
                <ReactMarkdown>{resultado.registro_liberacao}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <EmptyState
                icon={Sparkles}
                title="Nenhuma descrição gerada"
                description="Marque casos com a flag Liberação e clique em Gerar descrição com IA."
                className="min-h-[200px] px-2"
              />
              {gerarButton}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
