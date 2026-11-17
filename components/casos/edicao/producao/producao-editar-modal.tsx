"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  AlertTriangle,
  Clock,
  FolderKanban,
  HandHeart,
  Loader2,
  Save,
  User,
  Wrench,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ComboboxOption } from "@/components/ui/combobox";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import {
  apiStringToDate,
  dateTimeToApiString,
} from "@/components/ui/date-picker";
import { useAtualizarProducao } from "@/hooks/producao/use-atualizar-producao";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { useProjetos } from "@/hooks/catalogos/use-projetos";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
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
const ANOTACAO_MAX = 2000;

const MSG_OBRIGATORIOS = "Preencha todos os campos obrigatórios.";
const MSG_DATAS = "Informe a data e hora de abertura e de fechamento.";
const MSG_ORDEM = "O fechamento deve ser posterior à abertura.";

const producaoEditarSchema = z
  .object({
    tipo: z.string().trim().min(1, MSG_OBRIGATORIOS),
    usuario: z.string().trim().min(1, MSG_OBRIGATORIOS),
    projeto: z.string().trim().min(1, MSG_OBRIGATORIOS),
    /** Usuário que ajudou ("valeu"); opcional. */
    valeuUsuario: z.string(),
    anotacao: z
      .string()
      .max(ANOTACAO_MAX, `A anotação pode ter até ${ANOTACAO_MAX} caracteres.`),
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

/** Id > 0 vira texto para o combobox; 0/null (sem valor no legado) vira "". */
function idParaCampo(id: number | null | undefined): string {
  return id != null && id > 0 ? String(id) : "";
}

function toFormValues(
  producao: ProducaoDetalheItem | null,
): ProducaoEditarFormData {
  return {
    tipo: producao?.tipo ?? "",
    usuario: idParaCampo(producao?.usuario_id),
    projeto: idParaCampo(producao?.projeto_id),
    valeuUsuario: idParaCampo(producao?.valeu_usuario_id),
    anotacao: producao?.anotacao ?? "",
    abertura: apiStringToDate(producao?.datas?.abertura ?? null),
    fechamento: apiStringToDate(producao?.datas?.fechamento ?? null),
  };
}

function mesmoMinuto(a: Date | undefined, b: Date | undefined): boolean {
  if (!a || !b) return a === b;
  return normalizeDateToMinute(a).getTime() === normalizeDateToMinute(b).getTime();
}

function houveAlteracao(
  atual: ProducaoEditarFormData,
  original: ProducaoEditarFormData,
): boolean {
  return (
    atual.tipo !== original.tipo ||
    atual.usuario !== original.usuario ||
    atual.projeto !== original.projeto ||
    atual.valeuUsuario !== original.valeuUsuario ||
    atual.anotacao.trim() !== original.anotacao.trim() ||
    !mesmoMinuto(atual.abertura, original.abertura) ||
    !mesmoMinuto(atual.fechamento, original.fechamento)
  );
}

/** Garante que o valor salvo apareça mesmo se não estiver na lista carregada. */
function comOpcaoAtual(
  opcoes: ComboboxOption[],
  valor: string,
  label: string | null | undefined,
): ComboboxOption[] {
  if (!valor || opcoes.some((opcao) => opcao.value === valor)) return opcoes;
  return [{ value: valor, label: label?.trim() || `#${valor}` }, ...opcoes];
}

export interface ProducaoEditarModalProps {
  /** Lançamento em edição; null fecha o modal. */
  producao: ProducaoDetalheItem | null;
  casoId: number;
  /** Setor do projeto do caso: filtra a lista de projetos (como na edição do caso). */
  setorProjeto?: string;
  onClose: () => void;
  /** Chamado depois de salvar com sucesso (recarrega o caso). */
  onSaved: () => void;
}

export function ProducaoEditarModal({
  producao,
  casoId,
  setorProjeto,
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

  // Catálogos só carregam com o modal aberto.
  const { data: usuarios, isLoading: isUsuariosLoading } = useRelatores({
    enabled: open,
  });
  const [buscaProjeto, setBuscaProjeto] = useState("");
  const buscaProjetoDebounced = useDebouncedValue(buscaProjeto, 300);
  const { data: projetos, isLoading: isProjetosLoading } = useProjetos({
    setor_projeto: setorProjeto?.trim() || undefined,
    search: buscaProjetoDebounced || undefined,
    enabled: open,
    requireSetorProjeto: false,
  });

  const [usuarioAtual, projetoAtual, valeuAtual, abertura, fechamento, anotacaoAtual] =
    useWatch({
      control: methods.control,
      name: [
        "usuario",
        "projeto",
        "valeuUsuario",
        "abertura",
        "fechamento",
        "anotacao",
      ],
    });
  // Limitação do legado: o PUT ignora anotação vazia (nem "" nem null limpam).
  const apagandoAnotacaoSalva =
    Boolean(producao?.anotacao?.trim()) && !anotacaoAtual?.trim();

  const opcoesUsuarios = useMemo<ComboboxOption[]>(
    () =>
      (usuarios ?? []).map((usuario) => ({
        value: String(usuario.id),
        label: usuario.nome_suporte,
      })),
    [usuarios],
  );
  const opcoesUsuario = useMemo(
    () => comOpcaoAtual(opcoesUsuarios, usuarioAtual, producao?.usuario_nome),
    [opcoesUsuarios, usuarioAtual, producao?.usuario_nome],
  );
  const opcoesValeu = useMemo(
    () =>
      comOpcaoAtual(opcoesUsuarios, valeuAtual, producao?.valeu_usuario_nome),
    [opcoesUsuarios, valeuAtual, producao?.valeu_usuario_nome],
  );
  // A lista de projetos muda com a busca no servidor; guarda os nomes já vistos para o
  // projeto selecionado não virar "#id" quando sai da lista filtrada.
  const nomesProjetoRef = useRef(new Map<string, string>());
  const opcoesProjeto = useMemo(() => {
    const opcoes = (projetos ?? []).map((projeto) => ({
      value: String(projeto.id),
      label: `${projeto.id} | ${projeto.nome_projeto}`,
    }));
    for (const opcao of opcoes) {
      nomesProjetoRef.current.set(opcao.value, opcao.label);
    }
    return comOpcaoAtual(
      opcoes,
      projetoAtual,
      nomesProjetoRef.current.get(projetoAtual),
    );
  }, [projetos, projetoAtual]);

  const duracao = useMemo(() => {
    if (!abertura || !fechamento) return null;
    const minutos = minutosDuracaoEdicao(abertura, fechamento, new Date());
    return minutos != null && minutos > 0 ? minutos : null;
  }, [abertura, fechamento]);

  const { errors, isValid } = methods.formState;
  const erro =
    errors.tipo?.message ??
    errors.usuario?.message ??
    errors.projeto?.message ??
    errors.abertura?.message ??
    errors.fechamento?.message ??
    errors.anotacao?.message ??
    null;

  async function onSubmit(data: ProducaoEditarFormData) {
    if (!producao) return;
    if (!houveAlteracao(data, toFormValues(producao))) {
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
          // Projeto vai em cronograma_id; `registro` no legado é o caso (decisão #9).
          cronograma_id: Number(data.projeto),
          usuario: Number(data.usuario),
          // Sem ajudante vai 0, como o legado guarda "ninguém".
          valeu_usuario_id: data.valeuUsuario ? Number(data.valeuUsuario) : 0,
          anotacao: data.anotacao.trim(),
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
          className="flex min-w-0 flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
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

            <Controller
              control={methods.control}
              name="usuario"
              render={({ field }) => (
                <ComboboxField
                  label="Usuário"
                  icon={User}
                  required
                  options={opcoesUsuario}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecione o usuário..."
                  emptyText="Nenhum usuário encontrado."
                  isLoading={isUsuariosLoading}
                  disabled={isSaving}
                  wrapperClassName="min-w-0"
                  clearable={false}
                />
              )}
            />
          </div>

          <Controller
            control={methods.control}
            name="projeto"
            render={({ field }) => (
              <ComboboxField
                label="Projeto"
                icon={FolderKanban}
                required
                options={opcoesProjeto}
                value={field.value}
                onValueChange={field.onChange}
                onSearchChange={setBuscaProjeto}
                placeholder="Selecione o projeto..."
                emptyText="Nenhum projeto encontrado."
                isLoading={isProjetosLoading}
                disabled={isSaving}
                wrapperClassName="min-w-0"
                clearable={false}
              />
            )}
          />

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

          <Controller
            control={methods.control}
            name="valeuUsuario"
            render={({ field }) => (
              <ComboboxField
                label="Quem ajudou (valeu)"
                icon={HandHeart}
                options={opcoesValeu}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Ninguém"
                emptyText="Nenhum usuário encontrado."
                isLoading={isUsuariosLoading}
                disabled={isSaving}
                wrapperClassName="min-w-0"
              />
            )}
          />

          <div className="space-y-2">
            <Label
              htmlFor="producao-editar-anotacao"
              className="text-sm font-medium text-text-label"
            >
              Anotação
            </Label>
            <Textarea
              id="producao-editar-anotacao"
              placeholder="Qualquer informação sobre esta produção..."
              rows={3}
              maxLength={ANOTACAO_MAX}
              disabled={isSaving}
              {...methods.register("anotacao")}
            />
            {apagandoAnotacaoSalva ? (
              <p className="text-xs text-text-secondary">
                Apagar todo o texto não remove a anotação já salva: o sistema mantém a
                anterior. Para mudar, escreva um texto novo.
              </p>
            ) : null}
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
