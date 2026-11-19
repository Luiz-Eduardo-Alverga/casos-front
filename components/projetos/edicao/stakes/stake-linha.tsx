"use client";

import type { KeyboardEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Trash2, User } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import type { ComboboxOption } from "@/components/ui/combobox";
import { maskHHMM } from "@/components/casos/edicao/producao/utils";
import { cn } from "@/lib/utils";
import { formatHorasResumoTotais } from "@/components/projetos/edicao/stakes/utils";
import {
  lerHorasTolerante,
  totalLinhaMin,
} from "@/components/projetos/edicao/stakes/stakes-lista-utils";
import type { StakesListaFormValues } from "@/components/projetos/edicao/stakes/stakes-lista-schema";
import type {
  StakeLinha as StakeLinhaValores,
  StakeLinhaErros,
  StakeLinhaStatus,
} from "@/components/projetos/edicao/stakes/stakes-lista.types";

export const STAKES_LISTA_COLUNAS = 8;

const CAMPO_CLASS = "h-8 rounded-lg border-border-input px-2 text-sm";

const FAIXA_STATUS: Record<StakeLinhaStatus, string> = {
  nova: "bg-status-info",
  alterada: "bg-panel-badge-importance-yellow",
  salva: "bg-transparent",
};

export interface StakeLinhaProps {
  index: number;
  linha: StakeLinhaValores;
  status: StakeLinhaStatus;
  erros?: StakeLinhaErros;
  tipoOptions: ComboboxOption[];
  colaboradorOptions: ComboboxOption[];
  isLoadingColaboradores?: boolean;
  canEdit: boolean;
  isLast: boolean;
  disabled?: boolean;
  /** Qualquer mudança na linha (limpa erros e problema de importação). */
  onAlterou: (index: number) => void;
  onExcluir: (index: number) => void;
  /** Enter num campo de texto da última linha (decisão #23). */
  onEnterUltima: () => void;
}

export function StakeLinha({
  index,
  linha,
  status,
  erros,
  tipoOptions,
  colaboradorOptions,
  isLoadingColaboradores,
  canEdit,
  isLast,
  disabled = false,
  onAlterou,
  onExcluir,
  onEnterUltima,
}: StakeLinhaProps) {
  const { control, register, setValue } = useFormContext<StakesListaFormValues>();
  const somenteLeitura = !canEdit || disabled;
  const campoErro = erros?.campos ?? {};
  const mensagens = [
    ...(erros?.mensagens ?? []),
    ...(linha.problemaImportacao && !erros?.mensagens.includes(linha.problemaImportacao)
      ? [linha.problemaImportacao]
      : []),
  ];

  const total = totalLinhaMin(linha);

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (isLast) onEnterUltima();
  };

  const opcoesTipo =
    linha.idTipo && !tipoOptions.some((o) => o.value === linha.idTipo)
      ? [{ value: linha.idTipo, label: `Função #${linha.idTipo}` }, ...tipoOptions]
      : tipoOptions;
  const opcoesColaborador =
    linha.colaboradorId &&
    !colaboradorOptions.some((o) => o.value === linha.colaboradorId)
      ? [
          {
            value: linha.colaboradorId,
            label: linha.colaboradorLabel || `#${linha.colaboradorId}`,
          },
          ...colaboradorOptions,
        ]
      : colaboradorOptions;

  const campoHoras = (nome: "planejada" | "naoPlanejada", rotulo: string) => (
    <Controller
      control={control}
      name={`linhas.${index}.${nome}`}
      render={({ field }) => (
        <Input
          ref={field.ref}
          value={field.value}
          inputMode="numeric"
          clearable={false}
          placeholder="00:00"
          aria-label={`${rotulo} da linha ${index + 1}`}
          aria-invalid={Boolean(campoErro[nome])}
          disabled={somenteLeitura}
          className={cn(CAMPO_CLASS, "w-[76px] tabular-nums", campoErro[nome] && "border-destructive")}
          onChange={(e) => {
            field.onChange(maskHHMM(e.target.value));
            onAlterou(index);
          }}
          onBlur={() => {
            const normalizada = lerHorasTolerante(field.value);
            if (normalizada && normalizada !== field.value) field.onChange(normalizada);
            field.onBlur();
          }}
          onKeyDown={handleEnter}
        />
      )}
    />
  );

  return (
    <>
      <TableRow
        className={cn(
          "border-border-divider bg-background hover:bg-background",
          mensagens.length > 0 && "border-b-0",
        )}
      >
        <TableCell className="relative w-[180px] py-1.5 pl-4 pr-2 align-top">
          <span
            aria-hidden
            className={cn("absolute inset-y-1 left-0 w-[3px] rounded-r", FAIXA_STATUS[status])}
          />
          <Controller
            control={control}
            name={`linhas.${index}.idTipo`}
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(v) => {
                  field.onChange(v);
                  onAlterou(index);
                }}
                disabled={somenteLeitura}
              >
                <SelectTrigger
                  ref={field.ref}
                  aria-label={`Função da linha ${index + 1}`}
                  aria-invalid={Boolean(campoErro.idTipo)}
                  className={cn(CAMPO_CLASS, "w-full", campoErro.idTipo && "border-destructive")}
                >
                  <SelectValue placeholder="Função..." />
                </SelectTrigger>
                <SelectContent>
                  {opcoesTipo.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </TableCell>
        <TableCell className="w-[230px] px-2 py-1.5 align-top">
          <Controller
            control={control}
            name={`linhas.${index}.colaboradorId`}
            render={({ field }) => (
              <div
                className={cn(
                  "rounded-lg",
                  campoErro.colaboradorId && "ring-1 ring-destructive",
                )}
              >
                <ComboboxField
                  label={`Colaborador da linha ${index + 1}`}
                  hideLabel
                  icon={User}
                  options={opcoesColaborador}
                  value={field.value}
                  onValueChange={(v) => {
                    const valor = v ?? "";
                    field.onChange(valor);
                    setValue(
                      `linhas.${index}.colaboradorLabel`,
                      opcoesColaborador.find((o) => o.value === valor)?.label ?? "",
                    );
                    onAlterou(index);
                  }}
                  placeholder="Colaborador..."
                  emptyText="Nenhum colaborador encontrado."
                  isLoading={isLoadingColaboradores}
                  disabled={somenteLeitura}
                  controlHeightClassName="h-8"
                />
              </div>
            )}
          />
        </TableCell>
        <TableCell className="w-[96px] px-2 py-1.5 align-top">
          {campoHoras("planejada", "Horas planejadas por dia")}
        </TableCell>
        <TableCell className="w-[96px] px-2 py-1.5 align-top">
          {campoHoras("naoPlanejada", "Horas não planejadas por dia")}
        </TableCell>
        <TableCell className="w-[80px] px-2 py-1.5 align-top">
          <Controller
            control={control}
            name={`linhas.${index}.dias`}
            render={({ field }) => (
              <Input
                ref={field.ref}
                value={field.value}
                inputMode="numeric"
          clearable={false}
                aria-label={`Dias da linha ${index + 1}`}
                aria-invalid={Boolean(campoErro.dias)}
                disabled={somenteLeitura}
                className={cn(CAMPO_CLASS, "w-[60px] tabular-nums", campoErro.dias && "border-destructive")}
                onChange={(e) => {
                  field.onChange(e.target.value.replace(/\D/g, "").slice(0, 3));
                  onAlterou(index);
                }}
                onBlur={field.onBlur}
                onKeyDown={handleEnter}
              />
            )}
          />
        </TableCell>
        <TableCell className="w-[88px] px-2 py-1.5 align-top">
          <span className="flex h-8 items-center text-sm font-semibold tabular-nums text-text-primary">
            {total == null ? "—" : formatHorasResumoTotais(total)}
          </span>
        </TableCell>
        <TableCell className="min-w-[200px] px-2 py-1.5 align-top">
          <Input
            clearable={false}
            {...register(`linhas.${index}.observacao`, {
              onChange: () => onAlterou(index),
            })}
            placeholder="Observação (opcional)"
            aria-label={`Observação da linha ${index + 1}`}
            disabled={somenteLeitura}
            className={cn(CAMPO_CLASS, "w-full")}
            onKeyDown={handleEnter}
          />
        </TableCell>
        <TableCell className="w-[52px] py-1.5 pl-1 pr-4 text-right align-top">
          {canEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onExcluir(index)}
              disabled={disabled}
              aria-label={`Excluir a linha ${index + 1}`}
            >
              <Trash2 className="h-4 w-4 text-text-secondary" />
            </Button>
          ) : null}
        </TableCell>
      </TableRow>
      {mensagens.length > 0 ? (
        <TableRow className="border-border-divider bg-background hover:bg-background">
          <TableCell colSpan={STAKES_LISTA_COLUNAS} className="px-4 pb-1.5 pt-0">
            <p role="alert" className="text-xs text-destructive">
              Linha {index + 1}: {mensagens.join(" · ")}
            </p>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
