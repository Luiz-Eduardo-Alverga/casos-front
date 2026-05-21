"use client";

import { CalendarDays, Package, User } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CasoFormSetor } from "@/components/fields/caso-form-setor";
import { CasoFormProjetoTipo } from "@/components/fields/caso-form-projeto-tipo";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { CasoFormProjetoStatus } from "@/components/fields/caso-form-projeto-status";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import type { ProjetoFormData } from "@/components/projetos/cadastro/schema";

export function ProjetoCreateLeftColumn() {
  const { isDisabled } = useCasoForm();
  const { control, register, formState } =
    useFormContext<ProjetoFormData>();

  const nomeError = formState.errors.nomeProjeto?.message;
  const dataInicioError = formState.errors.dataInicio?.message as
    | string
    | undefined;

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[362px]">
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Dados do Projeto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium text-text-label">
                Nome Projeto <span className="text-text-error">*</span>
              </Label>
              {nomeError && (
                <p className="text-sm text-destructive">{nomeError}</p>
              )}
            </div>
            <Input
              placeholder="Informe o nome do projeto..."
              className="h-9 rounded-lg border-border-input"
              disabled={isDisabled}
              {...register("nomeProjeto")}
            />
          </div>

          <Controller
            name="dataInicio"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Data de Início"
                required
                hideLabel={false}
                value={field.value}
                onChange={field.onChange}
                placeholder="Informe a data de início..."
                disabled={isDisabled}
                controlHeightClassName="h-9"
              />
            )}
          />
          {dataInicioError && (
            <p className="text-sm text-destructive sm:col-span-2">
              {dataInicioError}
            </p>
          )}
          <Controller
            name="dataEncerramento"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Data de encerramento"
                value={field.value}
                onChange={field.onChange}
                placeholder="Informe a data de encerramento..."
                disabled={isDisabled}
                controlHeightClassName="h-9"
              />
            )}
          />

          <CasoFormSetor required={false} />
          <CasoFormProjetoTipo required />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Responsável
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3">
          <CasoFormRelator
            name="usuario"
            label="Responsável"
            placeholder="Selecione o responsável..."
            required
          />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Status do Projeto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3">
          <CasoFormProjetoStatus required />
        </CardContent>
      </Card>
    </div>
  );
}
