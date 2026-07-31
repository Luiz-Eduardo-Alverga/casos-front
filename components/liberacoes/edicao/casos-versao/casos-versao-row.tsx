"use client";

import { Loader2, Pencil, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReportIdBadge } from "@/components/reports/layout/report-badges";
import { VersaoChip } from "@/components/liberacoes/versao-chip";
import { formatLiberacaoDateDisplay } from "@/components/liberacoes/utils";
import { cn } from "@/lib/utils";
import type { CasoVersaoRowState } from "@/components/liberacoes/edicao/casos-versao/utils";

interface CasosVersaoRowProps {
  item: CasoVersaoRowState;
  selected: boolean;
  isSaving?: boolean;
  canSave?: boolean;
  onToggleSelected: () => void;
  onDescricaoChange: (value: string) => void;
  onLiberacaoChange: (value: boolean) => void;
  onSave: () => void;
}

export function CasosVersaoRow({
  item,
  selected,
  isSaving = false,
  canSave = false,
  onToggleSelected,
  onDescricaoChange,
  onLiberacaoChange,
  onSave,
}: CasosVersaoRowProps) {
  const moduloLabel = item.modulo?.trim() || null;

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardContent className="flex items-start gap-3 p-5">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelected()}
          className="mt-1 shrink-0"
          aria-label={`Selecionar caso #${item.id}`}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <ReportIdBadge id={item.id} />
            <VersaoChip versao={item.versao} />
            {moduloLabel ? (
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-text-secondary">
                {moduloLabel}
              </span>
            ) : null}
            <span className="ml-auto font-mono text-[11.5px] text-text-secondary">
              {formatLiberacaoDateDisplay(item.dataAbertura)}
            </span>
          </div>

          <p className="mb-3 text-sm font-semibold leading-relaxed text-text-primary">
            {item.resumo || "—"}
          </p>

          <div className="flex items-stretch gap-3">
            <div className="min-w-0 flex-1 space-y-1.5 border-l border-border-divider pl-3">
              <Label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                <Pencil className="h-3 w-3 shrink-0" aria-hidden />
                Descrição da liberação
              </Label>
              <Textarea
                value={item.descricao}
                onChange={(e) => onDescricaoChange(e.target.value)}
                placeholder="Escreva o que mudou neste ticket..."
                rows={3}
                className="min-h-[72px] resize-none rounded-lg border-border-input text-[13px]"
                disabled={isSaving}
              />
            </div>

            <div className="flex shrink-0 flex-col justify-end gap-2">
              <label
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "cursor-pointer justify-start gap-2",
                  isSaving && "pointer-events-none opacity-50",
                )}
              >
                <Checkbox
                  checked={item.liberacao}
                  onCheckedChange={(checked) =>
                    onLiberacaoChange(checked === true)
                  }
                  disabled={isSaving}
                  aria-label="Liberação"
                />
                Liberação
              </label>
              <Button
                type="button"
                size="sm"
                disabled={!canSave || isSaving}
                onClick={onSave}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
