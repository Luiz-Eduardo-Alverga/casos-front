"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Check, ShieldAlert, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LiberacaoCardHeader } from "@/components/liberacoes/liberacao-card-header";
import { cn } from "@/lib/utils";
import type { LiberacaoItem } from "@/interfaces/liberacao";
import type { LiberacaoEditFormData } from "@/components/liberacoes/edicao/schema";

interface FlagsCardProps {
  liberacao: LiberacaoItem;
  disabled?: boolean;
}

export function FlagsCard({ liberacao, disabled }: FlagsCardProps) {
  const { control } = useFormContext<LiberacaoEditFormData>();

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <LiberacaoCardHeader icon={ShieldAlert} title="Flags" />
      <CardContent className="p-6 pt-2 space-y-4">
        <Controller
          control={control}
          name="gerarOcorrenciasLiberacao"
          render={({ field }) => (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Label className="text-sm font-medium text-text-primary">
                  Gerar ocorrências de liberação
                </Label>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Cria eventos automáticos ao liberar a versão final.
                </p>
              </div>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </div>
          )}
        />

        <div className="h-px bg-border-divider" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-text-primary">Já liberado</div>
            <div className="mt-0.5 text-xs text-text-secondary">
              Somente leitura — definido pelo sistema.
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
              liberacao.ja_liberado
                ? "bg-green-50 text-green-700"
                : "bg-muted text-text-secondary",
            )}
          >
            {liberacao.ja_liberado ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            {liberacao.ja_liberado ? "Sim" : "Não"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
