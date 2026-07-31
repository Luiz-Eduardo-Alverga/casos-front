"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { LiberacaoCardHeader } from "@/components/liberacoes/liberacao-card-header";
import { parseLiberacaoDate } from "@/components/liberacoes/utils";
import type { LiberacaoItem } from "@/interfaces/liberacao";
import type { LiberacaoEditFormData } from "@/components/liberacoes/edicao/schema";

interface VersaoFinalCardProps {
  liberacao: LiberacaoItem;
  disabled?: boolean;
}

export function VersaoFinalCard({ liberacao, disabled }: VersaoFinalCardProps) {
  const { control } = useFormContext<LiberacaoEditFormData>();
  const dataLiberacao = parseLiberacaoDate(
    liberacao.versao_final_data_liberacao,
  );

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <LiberacaoCardHeader icon={Zap} title="Versão final" />
      <CardContent className="p-6 pt-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="versaoFinalDataPrevista"
            render={({ field }) => (
              <DatePickerInput
                label="Data prevista"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                controlHeightClassName="h-9"
              />
            )}
          />
          <DatePickerInput
            label="Data de liberação"
            value={dataLiberacao}
            onChange={() => undefined}
            disabled
            controlHeightClassName="h-9"
          />
        </div>
      </CardContent>
    </Card>
  );
}
