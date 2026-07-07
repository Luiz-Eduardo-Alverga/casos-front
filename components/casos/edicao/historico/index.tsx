"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { CalendarDays, ChevronUp, Pencil, User } from "lucide-react";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { cn } from "@/lib/utils";
import type { CasoHistoricoItem } from "@/services/projeto-casos/get-historico";
import { HistoricoTimelineSkeleton } from "./historico-skeleton";
import { mapearHistoricoParaTimeline } from "./utils";

const LIMITE_CAMPOS_VISIVEIS = 2;

export interface AbaHistoricoProps {
  numeroCaso: number;
  historico: CasoHistoricoItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Erro ao carregar histórico do caso.";
}

export function AbaHistorico({
  numeroCaso,
  historico,
  isLoading = false,
  isFetching = false,
  error,
}: AbaHistoricoProps) {
  const [expandidoPorSeq, setExpandidoPorSeq] = useState<
    Record<number, boolean>
  >({});

  const eventos = useMemo(
    () => mapearHistoricoParaTimeline(historico ?? []),
    [historico],
  );

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
      <CasoEditCardHeader
        title="Histórico de alterações"
        icon={CARD_HEADER_PRESETS.historico.icon}
        iconClassName={CARD_HEADER_PRESETS.historico.iconClassName}
        badge={numeroCaso}
      />

      <CardContent className="p-8 pt-3 flex flex-col lg:flex-1 min-h-0">
        {isLoading ? (
          <HistoricoTimelineSkeleton />
        ) : error ? (
          <div className="text-sm text-destructive">
            {getErrorMessage(error)}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhuma alteração encontrada para este caso.
          </div>
        ) : (
          <div className="min-h-0 overflow-y-auto pr-1">
            {/* Faixa à esquerda: com overflow-y auto o eixo X efetivo corta overflow; evita recorte do marcador. */}
            <div className="pl-5">
              <div className="border-l border-border-divider pl-6 space-y-6">
              {eventos.map((evento, indexEvento) => {
                const totalCampos = evento.campos.length;
                const expandido = Boolean(expandidoPorSeq[evento.seq]);
                const camposSempreVisiveis = evento.campos.slice(
                  0,
                  LIMITE_CAMPOS_VISIVEIS,
                );
                const camposExtras = evento.campos.slice(
                  LIMITE_CAMPOS_VISIVEIS,
                );
                const restantes = Math.max(
                  totalCampos - LIMITE_CAMPOS_VISIVEIS,
                  0,
                );
                const marcadorAzul = indexEvento % 2 === 0;
                const corMarcador = marcadorAzul
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";

                return (
                  <section key={evento.seq} className="relative">
                    <div
                      className={`absolute left-[-24px] top-1 z-10 h-6 w-6 -translate-x-1/2 rounded-full ${corMarcador} border border-card shadow-sm ring-4 ring-background flex items-center justify-center`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </div>

                    <header className="flex flex-wrap items-center justify-between gap-2 ">
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-full border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          {evento.usuario}{" "}
                          <span className="font-normal text-muted-foreground">
                            atualizou o caso
                          </span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {evento.dataAlteracao}
                      </span>
                    </header>

                    <div className="mt-2 space-y-2">
                      {evento.textoNaoParseado ? (
                        <div
                          className="rounded-lg bg-muted/30 px-4 py-2"
                          role="note"
                          aria-label="Trecho do histórico não estruturado"
                        >
                          <p className="text-xs whitespace-pre-wrap break-words text-muted-foreground">
                            {evento.textoNaoParseado}
                          </p>
                        </div>
                      ) : null}
                      {camposSempreVisiveis.map((campo, idx) => (
                        <article
                          key={`${evento.seq}-${campo.campo}-${idx}`}
                          className="rounded-lg bg-muted/30 px-4 py-2"
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {campo.campo}
                              </p>
                              <p
                                className={`text-xs whitespace-pre-wrap break-words ${
                                  campo.tipo === "novo_valor"
                                    ? "text-emerald-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {campo.tipo === "novo_valor"
                                  ? "Novo Valor: "
                                  : "Valor anterior: "}
                                {campo.valor || "—"}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                      <AnimatePresence initial={false}>
                        {expandido && restantes > 0 ? (
                          <motion.div
                            key={`historico-extras-${evento.seq}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.2,
                              ease: "easeInOut",
                            }}
                            className="overflow-hidden space-y-2"
                          >
                            {camposExtras.map((campo, idx) => (
                              <article
                                key={`${evento.seq}-extra-${campo.campo}-${idx}`}
                                className="rounded-lg bg-muted/30 px-4 py-2"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                      {campo.campo}
                                    </p>
                                    <p
                                      className={`text-xs whitespace-pre-wrap break-words ${
                                        campo.tipo === "novo_valor"
                                          ? "text-emerald-600"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {campo.tipo === "novo_valor"
                                        ? "Novo Valor: "
                                        : "Valor anterior: "}
                                      {campo.valor || "—"}
                                    </p>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    {restantes > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-2 h-auto px-1 text-sm text-blue-600 hover:text-blue-700"
                        onClick={() =>
                          setExpandidoPorSeq((prev) => ({
                            ...prev,
                            [evento.seq]: !expandido,
                          }))
                        }
                      >
                        <ChevronUp
                          className={cn(
                            "mr-1 h-4 w-4 shrink-0 transition-transform",
                            !expandido && "-rotate-180",
                          )}
                        />
                        {expandido
                          ? "Ver menos"
                          : `Ver mais ${restantes} campos`}
                      </Button>
                    )}
                  </section>
                );
              })}
              </div>
              {isFetching && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Atualizando histórico...
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
