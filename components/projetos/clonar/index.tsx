"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Copy, Info } from "lucide-react";
import toast from "react-hot-toast";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { formatDateTimeSgp } from "@/components/projetos/cadastro/utils";
import { formatSgpDateTimeToPt } from "@/components/projetos/utils";
import {
  NOME_PROJETO_MAX,
  projetoClonarSchema,
  type ProjetoClonarFormValues,
} from "@/components/projetos/clonar/schema";
import {
  duracaoEmDias,
  textoDuracao,
  valoresPadraoClone,
} from "@/components/projetos/clonar/utils";
import { useClonarSgpCadastro } from "@/hooks/projetos/use-clonar-sgp-cadastro";
import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";

const MSG_ORDEM_DATAS = "A data de fim deve ser igual ou posterior à de início";

const TEXTO_INFORMATIVO =
  "O novo projeto copia setor, PDV, classe, tipo, cliente, usuários autorizados e stakeholders do projeto de origem e começa com status Aberto. O objetivo não é copiado: preencha na aba Abertura do novo projeto. O projeto de origem não é alterado. Para levar casos, use \"Duplicar casos\" na aba Escopo do projeto de origem.";

interface ProjetoClonarModalProps {
  /** Projeto de origem; `null` mantém o modal fechado. */
  origem: SgpCadastroData | null;
  onOpenChange: (open: boolean) => void;
  /** Chamado com o projeto novo depois do sucesso (o modal já fechou). */
  onClonado?: (novo: SgpCadastroData) => void;
}

export function ProjetoClonarModal({
  origem,
  onOpenChange,
  onClonado,
}: ProjetoClonarModalProps) {
  const open = origem != null;
  const mutation = useClonarSgpCadastro();
  const isPending = mutation.isPending;
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<ProjetoClonarFormValues>({
    resolver: zodResolver(projetoClonarSchema),
  });
  const { control, register, reset, watch, handleSubmit, formState } = form;

  useEffect(() => {
    if (!origem) return;
    reset(valoresPadraoClone(origem));
    setApiError(null);
  }, [origem, reset]);

  useEffect(() => {
    const sub = watch(() => setApiError(null));
    return () => sub.unsubscribe();
  }, [watch]);

  const dataInicio = watch("dataInicio");
  const dataFim = watch("dataFim");
  const ordemInvalida =
    dataInicio instanceof Date &&
    dataFim instanceof Date &&
    duracaoEmDias(dataInicio, dataFim) == null;

  const nomeError = formState.errors.nomeProjeto?.message;
  const inicioError = formState.errors.dataInicio?.message;
  const fimError = ordemInvalida
    ? MSG_ORDEM_DATAS
    : formState.errors.dataFim?.message;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!origem) return;
    setApiError(null);
    try {
      const response = await mutation.mutateAsync({
        origemId: origem.registro,
        data: {
          nome_projeto: values.nomeProjeto.trim(),
          data_inicio: formatDateTimeSgp(values.dataInicio),
          data_fim: formatDateTimeSgp(values.dataFim),
        },
      });
      const novo = response.data;
      toast.success(
        `${response.message || "Projeto clonado com sucesso"} · #${novo.registro} ${novo.nome_projeto}`,
      );
      onOpenChange(false);
      onClonado?.(novo);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Erro ao clonar projeto";
      setApiError(message);
      toast.error(message);
    }
  });

  const bloquearFechamento = (event: Event) => {
    if (isPending) event.preventDefault();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-[560px] min-w-0 overflow-y-auto p-0"
        onEscapeKeyDown={bloquearFechamento}
        onPointerDownOutside={bloquearFechamento}
        onInteractOutside={bloquearFechamento}
      >
        <DialogTitle className="sr-only">Clonar projeto</DialogTitle>

        <form onSubmit={onSubmit} noValidate className="bg-card flex flex-col rounded-lg">
          <div className="border-b border-border-divider px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-sm">
                <Copy className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-text-primary">
                  Clonar projeto
                </h3>
                <p className="text-xs text-text-secondary">
                  Cria um novo projeto com o mesmo cadastro do projeto de origem.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 pb-6 pt-4">
            {origem ? (
              <div className="space-y-1 rounded-lg border border-border-divider bg-muted/40 p-4">
                <p className="text-xs font-medium text-text-secondary">
                  Projeto de origem
                </p>
                <p className="text-sm font-semibold text-text-primary break-words">
                  #{origem.registro} {origem.nome_projeto}
                </p>
                <p className="text-xs text-text-secondary">
                  {[origem.setor, origem.pdv].filter(Boolean).join(" · ") || "—"}
                  {origem.classe_projeto ? ` · ${origem.classe_projeto}` : ""}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatSgpDateTimeToPt(origem.data_inicio || origem.datas)} a{" "}
                  {formatSgpDateTimeToPt(origem.data_fim || origem.data_desativado)}
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex justify-between gap-2">
                <Label
                  htmlFor="clonar-nome-projeto"
                  className="text-sm font-medium text-text-label"
                >
                  Nome do novo projeto <span className="text-text-error">*</span>
                </Label>
                {nomeError ? (
                  <p className="text-sm text-destructive">{nomeError}</p>
                ) : null}
              </div>
              <Input
                id="clonar-nome-projeto"
                maxLength={NOME_PROJETO_MAX}
                placeholder="Informe o nome do novo projeto..."
                className="h-9 rounded-lg border-border-input"
                disabled={isPending}
                aria-invalid={Boolean(nomeError)}
                {...register("nomeProjeto")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Controller
                  name="dataInicio"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      label="Data de início"
                      required
                      hideLabel={false}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="dd/mm/aaaa"
                      disabled={isPending}
                      controlHeightClassName="h-9"
                    />
                  )}
                />
                {inicioError ? (
                  <p className="text-sm text-destructive">{inicioError}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Controller
                  name="dataFim"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      label="Data de fim"
                      required
                      hideLabel={false}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="dd/mm/aaaa"
                      disabled={isPending}
                      controlHeightClassName="h-9"
                    />
                  )}
                />
                {fimError ? (
                  <p className="text-sm text-destructive">{fimError}</p>
                ) : null}
              </div>
            </div>

            <p className="text-sm text-text-secondary">
              Duração do novo projeto:{" "}
              <span className="font-semibold text-text-primary">
                {textoDuracao(duracaoEmDias(dataInicio, dataFim))}
              </span>
            </p>

            <div className="rounded-lg border border-border-divider bg-muted/40 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{TEXTO_INFORMATIVO}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border-divider px-6 py-4">
            {apiError ? (
              <div
                role="alert"
                className="flex items-start gap-2 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p className="break-words">{apiError}</p>
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending}
              >
                <Copy className="mr-2 size-4" />
                {isPending ? "Clonando..." : "Clonar projeto"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
