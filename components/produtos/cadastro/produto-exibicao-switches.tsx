"use client";

import { SlidersHorizontal } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchChoiceCard } from "@/components/ui/switch-choice-card";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { cn } from "@/lib/utils";
import type { ProdutoFormData } from "@/components/produtos/cadastro/schema";

const SWITCHES: Array<{
  name:
    | "mostrarConsulta"
    | "mostrarTeste"
    | "faqExibir"
    | "calcularBurndown"
    | "vacaLeiteira";
  label: string;
  hint: string;
}> = [
  {
    name: "mostrarConsulta",
    label: PRODUTO_LABELS.mostrarConsulta,
    hint: PRODUTO_LABELS.mostrarConsultaHint,
  },
  {
    name: "mostrarTeste",
    label: PRODUTO_LABELS.mostrarTeste,
    hint: PRODUTO_LABELS.mostrarTesteHint,
  },
  {
    name: "faqExibir",
    label: PRODUTO_LABELS.faqExibir,
    hint: PRODUTO_LABELS.faqExibirHint,
  },
  {
    name: "calcularBurndown",
    label: PRODUTO_LABELS.calcularBurndown,
    hint: PRODUTO_LABELS.calcularBurndownHint,
  },
  {
    name: "vacaLeiteira",
    label: PRODUTO_LABELS.vacaLeiteira,
    hint: PRODUTO_LABELS.vacaLeiteiraHint,
  },
];

export interface ProdutoExibicaoSwitchesProps {
  showIntro?: boolean;
  somenteLeitura?: boolean;
}

export function ProdutoExibicaoSwitches({
  showIntro = false,
  somenteLeitura = false,
}: ProdutoExibicaoSwitchesProps) {
  const { isDisabled } = useCasoForm();
  const { control } = useFormContext<ProdutoFormData>();

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            {PRODUTO_LABELS.exibicaoControle}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        {showIntro ? (
          <p className="mb-4 text-xs text-text-secondary">
            {PRODUTO_LABELS.exibicaoHint}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          {SWITCHES.map((item) => (
            <Controller
              key={item.name}
              control={control}
              name={item.name}
              render={({ field }) =>
                somenteLeitura ? (
                  <div className="flex min-h-[60px] items-center justify-between gap-5 rounded-lg border border-border bg-muted p-3">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {item.hint}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold",
                        field.value
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {field.value ? PRODUTO_LABELS.sim : PRODUTO_LABELS.nao}
                    </span>
                  </div>
                ) : (
                  <SwitchChoiceCard
                    id={`produto-exibicao-${item.name}`}
                    title={item.label}
                    description={item.hint}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isDisabled}
                  />
                )
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
