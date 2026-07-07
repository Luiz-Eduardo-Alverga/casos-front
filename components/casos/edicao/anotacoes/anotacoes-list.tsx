"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/painel/empty-state";
import type { AnotacaoCasoItem } from "@/interfaces/projeto-memoria";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, User } from "lucide-react";
import { formatarCriadoEm } from "./utils";
import { useEffect, useRef } from "react";

export interface AnotacoesListProps {
  anotacoes: AnotacaoCasoItem[];
  editandoId: number | null;
  editandoTexto: string;
  onEditandoTextoChange: (next: string) => void;
  onIniciarEdicao: (item: AnotacaoCasoItem) => void;
  onCancelarEdicao: () => void;
  onSalvarEdicao: () => void | Promise<void>;
  onAskDelete: (sequencia: number) => void;
  readOnly?: boolean;
}

export function AnotacoesList({
  anotacoes,
  editandoId,
  editandoTexto,
  onEditandoTextoChange,
  onIniciarEdicao,
  onCancelarEdicao,
  onSalvarEdicao,
  onAskDelete,
  readOnly = false,
}: AnotacoesListProps) {
  const lista = Array.isArray(anotacoes) ? anotacoes : [];
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /** Altura mínima do bloco de texto da anotação; expande com o conteúdo */
  const ALTURA_MIN_ANOTACAO = "min-h-[144px]";

  const ajustarAlturaTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (editandoId == null) return;
    const raf = requestAnimationFrame(() => ajustarAlturaTextarea());
    return () => cancelAnimationFrame(raf);
  }, [editandoId, editandoTexto]);

  if (lista.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
        <EmptyState
          imageAlt="Nenhuma anotação"
          imageSrc="/images/empty-state-casos-produto.svg"
          title="Nenhuma anotação"
          description="Adicione uma anotação acima."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col  gap-2  pt-4">
      {lista.map((item) => (
        <div key={item.sequencia} className="flex w-full flex-col gap-2">
          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40"
                aria-hidden
              >
                <User className="size-3.5 text-sky-700 dark:text-sky-400" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-semibold leading-5 text-foreground">
                  {item.usuario}
                </span>
                <span className="text-xs leading-5 text-text-secondary">
                  {formatarCriadoEm(item.data_anotacao)}
                </span>
              </div>
            </div>

            {!readOnly ? (
              <div className="flex shrink-0 items-center gap-3">
                {editandoId === item.sequencia ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onCancelarEdicao}
                      className="min-w-[86px] rounded-lg"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={onSalvarEdicao}
                      className="min-w-[86px]"
                    >
                      Salvar
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg"
                      onClick={() => onIniciarEdicao(item)}
                      aria-label="Editar anotação"
                    >
                      <Pencil className="size-4 text-foreground" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => onAskDelete(item.sequencia)}
                      aria-label="Excluir anotação"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {editandoId === item.sequencia && !readOnly ? (
            <Textarea
              ref={textareaRef}
              value={editandoTexto}
              onChange={(e) => {
                onEditandoTextoChange(e.target.value);
                requestAnimationFrame(() => ajustarAlturaTextarea());
              }}
              className={cn(
                "rounded-lg resize-none overflow-hidden",
                ALTURA_MIN_ANOTACAO,
              )}
            />
          ) : (
            <div
              className={cn(
                "w-full rounded-lg bg-muted/30 p-2.5 border-l-4 border-primary  text-xs font-semibold leading-5 text-foreground whitespace-pre-wrap",
                ALTURA_MIN_ANOTACAO,
              )}
            >
              {item.anotacoes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
