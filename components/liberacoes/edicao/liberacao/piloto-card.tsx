"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Link2, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { LiberacaoCardHeader } from "@/components/liberacoes/liberacao-card-header";
import type { LiberacaoEditFormData } from "@/components/liberacoes/edicao/schema";

interface PilotoCardProps {
  disabled?: boolean;
}

export function PilotoCard({ disabled }: PilotoCardProps) {
  const { control, register } = useFormContext<LiberacaoEditFormData>();

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <LiberacaoCardHeader icon={Rocket} title="Datas de piloto" />
      <CardContent className="p-6 pt-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="pilotoDataPrevista"
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
          <Controller
            control={control}
            name="pilotoDataLiberacao"
            render={({ field }) => (
              <DatePickerInput
                label="Data de liberação"
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                controlHeightClassName="h-9"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-text-label">
            URL da versão piloto
          </Label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="https://..."
              className="h-9 rounded-lg border-border-input pl-8"
              disabled={disabled}
              {...register("urlVersaoPiloto")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
