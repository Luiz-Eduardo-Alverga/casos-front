"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { AlertTriangle, Clock, Loader2, Save, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  apiStringToDate,
  dateTimeToApiString,
} from "@/components/ui/date-picker";
import { useAtualizarProducao } from "@/hooks/producao/use-atualizar-producao";
import type { ProducaoDetalheItem } from "@/interfaces/projeto-memoria";
import {
  formatDuracaoMinutos,
  minutosDuracaoEdicao,
  normalizeDateToMinute,
} from "./utils";

export const TIPOS_PRODUCAO = [
  "DESENVOLVENDO",
  "ANALISANDO",
  "RETORNO",
  "TESTANDO",
] as const;

const FORM_ID = "producao-editar-form";

const MSG_OBRIGATORIOS = "Preencha todos os campos obrigatórios.";
const MSG_DATAS = "Informe a data e hora de abertura e de fechamento.";
const MSG_ORDEM = "O fechamento deve ser posterior à abertura.";

const producaoEditarSchema = z
  .object({
    tipo: z.string().trim().min(1, MSG_OBRIGATORIOS),
    // Campos do protótipo que a API ainda não aceita: o PUT
    // /projeto-casos-producao/{sequencia} só recebe tipo_producao, hora_abertura e
    // hora_fechamento. Quando a API aceitar, descomentar aqui, nos defaults, no
    // JSX e no payload (procure por "Aguardando API").
    // usuario: z.string().trim().min(1, MSG_OBRIGATORIOS),
    // projeto: z.string().trim().min(1, MSG_OBRIGATORIOS),
    abertura: z.date().optional(),
    fechamento: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.abertura || !data.fechamento) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [data.abertura ? "fechamento" : "abertura"],
        message: MSG_DATAS,
      });
      return;
    }
    if (
      normalizeDateToMinute(data.fechamento).getTime() <=
      normalizeDateToMinute(data.abertura).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fechamento"],
        message: MSG_ORDEM,
      });
    }
  });

type ProducaoEditarFormData = z.infer<typeof producaoEditarSchema>;

function toFormValues(
  producao: ProducaoDetalheItem | null,
): ProducaoEditarFormData {
  return {
    tipo: producao?.tipo ?? "",
    // Aguardando API:
    // usuario: producao?.usuario_id ? String(producao.usuario_id) : "",
    // projeto: producao?.projeto_id ? String(producao.projeto_id) : "",
    abertura: apiStringToDate(producao?.datas?.abertura ?? null),
    fechamento: apiStringToDate(producao?.datas?.fechamento ?? null),
  };
}

function mesmoMinuto(a: Date | undefined, b: Date | undefined): boolean {
  if (!a || !b) return a === b;
  return normalizeDateToMinute(a).getTime() === normalizeDateToMinute(b).getTime();
}

export interface ProducaoEditarModalProps {
  /** Lançamento em edição; null fecha o modal. */
  producao: ProducaoDetalheItem | null;
  casoId: number;
  onClose: () => void;
  /** Chamado depois de salvar com sucesso (recarrega o caso). */
  onSaved: () => void;
}

export function ProducaoEditarModal({
  producao,
  casoId,
  onClose,
  onSaved,
}: ProducaoEditarModalProps) {
  const atualizarProducao = useAtualizarProducao();
  const isSaving = atualizarProducao.isPending;
  const open = producao != null;

  const methods = useForm<ProducaoEditarFormData>({
    resolver: zodResolver(producaoEditarSchema),
    mode: "onChange",
    defaultValues: toFormValues(producao),
  });

  useEffect(() => {
    if (!producao) return;
    methods.reset(toFormValues(producao));
    // Valida já na abertura: um lançamento salvo com duração zero mostra o motivo
    // de o botão estar desabilitado, em vez de só desabilitá-lo.
    void methods.trigger();
  }, [producao, methods]);

  const [abertura, fechamento] = useWatch({
    control: methods.control,
    name: ["abertura", "fechamento"],
  });
  const duracao = useMemo(() => {
    if (!abertura || !fechamento) return null;
    const minutos = minutosDuracaoEdicao(abertura, fechamento, new Date());
    return minutos != null && minutos > 0 ? minutos : null;
  }, [abertura, fechamento]);

  const { errors, isValid } = methods.formState;
  const erro =
    errors.tipo?.message ??
    errors.abertura?.message ??
    errors.fechamento?.message ??
    null;

  async function onSubmit(data: ProducaoEditarFormData) {
    if (!producao) return;
    const original = toFormValues(producao);
    const mudou =
      data.tipo !== original.tipo ||
      !mesmoMinuto(data.abertura, original.abertura) ||
      !mesmoMinuto(data.fechamento, original.fechamento);
    if (!mudou) {
      toast("Nenhuma alteração na produção.");
      onClose();
      return;
    }
    try {
      await atualizarProducao.mutateAsync({
        sequencia: producao.sequencia,
        payload: {
          tipo_producao: data.tipo,
          hora_abertura: dateTimeToApiString(data.abertura),
          hora_fechamento: dateTimeToApiString(data.fechamento),
          // Aguardando API (nomes dos campos a confirmar no legado):
          // usuario: Number(data.usuario),
          // cronograma_id: Number(data.projeto),
        },
      });
      toast.success("Produção atualizada com sucesso.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar produção.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isSaving) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto overflow-x-hidden sm:max-w-[580px]">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-panel-badge-fixed-bg text-panel-badge-fixed">
            <Wrench className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <DialogTitle>Editar produção</DialogTitle>
            <DialogDescription>
              {producao
                ? `Caso #${casoId} · lançamento ${producao.sequencia}`
                : null}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form
          id={FORM_ID}
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="producao-editar-tipo"
                className="text-sm font-medium text-text-label"
              >
                Tipo <span className="text-text-error">*</span>
              </Label>
              <Controller
                control={methods.control}
                name="tipo"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSaving}
                  >
                    <SelectTrigger
                      id="producao-editar-tipo"
                      className="h-9 text-sm"
                    >
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PRODUCAO.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Aguardando API: o PUT ainda não aceita trocar o usuário do lançamento.
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-label">
                Usuário <span className="text-text-error">*</span>
              </Label>
              <CasoFormRelator name="usuario" label="Usuário" hideLabel />
            </div>
            */}
          </div>

          {/* Aguardando API: o PUT ainda não aceita trocar o projeto do lançamento.
          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-label">
              Projeto <span className="text-text-error">*</span>
            </Label>
            <CasoFormProjeto name="projeto" hideLabel />
          </div>
          */}

          {/* Uma coluna: o campo de data com hora não cabe em meia largura do modal. */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-label">
                Abertura <span className="text-text-error">*</span>
              </Label>
              <Controller
                control={methods.control}
                name="abertura"
                render={({ field }) => (
                  <DatePickerInput
                    label="Abertura"
                    hideLabel
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      void methods.trigger(["abertura", "fechamento"]);
                    }}
                    disabled={isSaving}
                    showTime
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-label">
                Fechamento <span className="text-text-error">*</span>
              </Label>
              <Controller
                control={methods.control}
                name="fechamento"
                render={({ field }) => (
                  <DatePickerInput
                    label="Fechamento"
                    hideLabel
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      void methods.trigger(["abertura", "fechamento"]);
                    }}
                    disabled={isSaving}
                    showTime
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border-divider bg-muted/40 px-3.5 py-3">
            <span className="flex items-center gap-2 text-sm text-text-label">
              <Clock className="h-3.5 w-3.5 text-status-info" aria-hidden />
              Duração calculada
            </span>
            <b className="text-base text-status-info">
              {formatDuracaoMinutos(duracao)}
            </b>
          </div>

          {erro ? (
            <p
              role="alert"
              className="flex items-center gap-1.5 text-sm text-text-error"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {erro}
            </p>
          ) : null}
        </form>

        <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isSaving || !isValid}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
