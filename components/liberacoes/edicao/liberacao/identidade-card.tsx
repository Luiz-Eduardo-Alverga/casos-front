"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { IdCard, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { LiberacaoCardHeader } from "@/components/liberacoes/liberacao-card-header";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import {
  formatLiberacaoDateDisplay,
  produtosToOptions,
} from "@/components/liberacoes/utils";
import { TIPO_LIBERACAO_OPTIONS } from "@/components/liberacoes/constants";
import type { LiberacaoItem } from "@/interfaces/liberacao";
import type { LiberacaoEditFormData } from "@/components/liberacoes/edicao/schema";

interface IdentidadeCardProps {
  liberacao: LiberacaoItem;
  disabled?: boolean;
}

const TIPO_OPTIONS = TIPO_LIBERACAO_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export function IdentidadeCard({ liberacao, disabled }: IdentidadeCardProps) {
  const { register } = useFormContext<LiberacaoEditFormData>();
  const { data: produtos, isLoading: isProdutosLoading } = useProdutos();
  const produtoOptions = useMemo(() => produtosToOptions(produtos), [produtos]);

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <LiberacaoCardHeader icon={IdCard} title="Identidade" />
      <CardContent className="space-y-4 p-6 pt-2">
        <div className="grid grid-cols-2 items-end gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-label">
              Registro
            </Label>
            <Input
              value={`#${liberacao.registro}`}
              disabled
              className="h-9 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-label">
              Aberto em
            </Label>
            <Input
              value={formatLiberacaoDateDisplay(liberacao.datas)}
              disabled
              className="h-9 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 items-end gap-4">
          <ComboboxField
            name="produtoId"
            label="Produto"
            icon={IdCard}
            options={produtoOptions}
            placeholder="Selecione o produto..."
            emptyText="Nenhum produto encontrado."
            isLoading={isProdutosLoading}
            disabled={disabled}
            required
            controlHeightClassName="h-9"
          />

          <ComboboxField
            name="tipoLiberacao"
            label="Tipo de liberação"
            icon={Layers}
            options={TIPO_OPTIONS}
            placeholder="Selecione o tipo..."
            emptyText="Nenhum tipo encontrado."
            disabled={disabled}
            controlHeightClassName="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-text-label">
            Observação
          </Label>
          <Textarea
            placeholder="Escopo, contexto ou notas..."
            className="min-h-[88px] resize-none rounded-lg border-border-input"
            disabled={disabled}
            {...register("observacao")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
