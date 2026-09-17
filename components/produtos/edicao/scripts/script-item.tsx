"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ScriptCopyButton } from "@/components/produtos/edicao/scripts/script-copy-button";
import { normalizeScriptText } from "@/components/produtos/edicao/scripts/script-form-utils";
import type { ProdutoScriptData } from "@/services/produtos/types";

export interface ScriptItemProps {
  script: ProdutoScriptData;
  showSemOrdemDivider?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (script: ProdutoScriptData) => void;
  onDelete: (script: ProdutoScriptData) => void;
}

export function ScriptItem({
  script,
  showSemOrdemDivider = false,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ScriptItemProps) {
  const procedimento = normalizeScriptText(script.procedimento);
  const showActions = canEdit || canDelete;
  const ordemLabel =
    script.ordenador != null ? String(script.ordenador) : "—";

  return (
    <AccordionItem
      value={String(script.id)}
      className="border-b border-border-divider"
    >
      {showSemOrdemDivider ? (
        <div className="flex items-center gap-2 bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {PRODUTO_LABELS.semOrdem}
        </div>
      ) : null}
      <div className="relative">
        <AccordionTrigger
          className={
            showActions
              ? "gap-2 px-4 py-4 pr-16 hover:bg-muted/30 hover:no-underline [&>svg]:order-first"
              : "gap-2 px-4 py-4 hover:bg-muted/30 hover:no-underline [&>svg]:order-first"
          }
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
            {ordemLabel}
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground">
            {script.descricao}
          </span>
        </AccordionTrigger>
        {showActions ? (
          <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center">
            {canEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                aria-label={PRODUTO_LABELS.editar}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(script);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label={PRODUTO_LABELS.excluir}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(script);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      <AccordionContent className="px-4 pb-4 pl-11">
        <div className="relative rounded-lg border border-border bg-muted">
          <ScriptCopyButton text={procedimento} />
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words px-4 py-4 pr-28 font-mono text-xs leading-relaxed text-foreground">
            {procedimento}
          </pre>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

