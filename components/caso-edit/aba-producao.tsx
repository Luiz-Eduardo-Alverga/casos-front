"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/painel/empty-state";
import { TamanhoCombobox } from "./fields/tamanho-combobox";
import { ProducaoMetricaCard } from "./producao-metrica-card";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import {
  DateTimePicker,
  apiStringToDate,
  dateTimeToApiString,
} from "@/components/ui/date-picker";
import { useAtualizarProducao } from "@/hooks/use-atualizar-producao";
import { useExcluirProducao } from "@/hooks/use-excluir-producao";
import { Package, Pencil, Trash2 } from "lucide-react";
import type {
  ProjetoMemoriaItem,
  ProducaoDetalheItem,
} from "@/interfaces/projeto-memoria";

export interface AbaProducaoSavePayload {
  TempoEstimado?: string | null;
  tamanho?: number | null;
  NaoPlanejado?: number | boolean;
}

export interface AbaProducaoProps {
  casoId: number;
  item: ProjetoMemoriaItem;
  onSaveProducao: (payload: AbaProducaoSavePayload) => Promise<void>;
  onProducaoAlterada?: () => void;
  isSaving?: boolean;
}

function formatMinutos(minutos: number): string {
  if (minutos === 0) return "0 minutos";
  return `${minutos} minutos`;
}

/** Exibe tempo realizado/teste: abaixo de 1h em minutos; a partir de 1h como "1 hora e 30 minutos". */
function formatMinutosHoraEMinutos(minutos: number): string {
  if (minutos === 0) return "0 minutos";
  if (minutos < 60) {
    return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
  }
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const parteHoras = h === 1 ? "1 hora" : `${h} horas`;
  if (m === 0) return parteHoras;
  const parteMin = m === 1 ? "1 minuto" : `${m} minutos`;
  return `${parteHoras} e ${parteMin}`;
}

function formatTempoExcedido(estimado: number, realizado: number): string {
  const diff = realizado - estimado;
  const sign = diff >= 0 ? "" : "-";
  const absMin = Math.abs(diff);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Formata data/hora da API (YYYY-MM-DD HH:mm:ss) para exibição (DD/MM/YYYY HH:mm) */
function formatDataHoraProducao(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const s = value.trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return s;
  const [, y, m, d, h, min] = match;
  return `${d}/${m}/${y} ${h}:${min}`;
}

/** Classifica tipo de produção para somar tempo em aberto nas métricas de dev vs. teste. */
function isProducaoTipoTeste(tipo: string | null | undefined): boolean {
  const t = (tipo ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return (
    t.includes("teste") ||
    t.includes("test") ||
    t.includes("qa") ||
    t.includes("qualidade")
  );
}

/**
 * Parse data/hora da API com segundos (YYYY-MM-DD HH:mm:ss).
 * O `apiStringToDate` do date-picker zera os segundos e distorce os minutos de duração.
 */
function parseDataHoraProducaoApi(
  value: string | null | undefined,
): Date | undefined {
  if (!value?.trim()) return undefined;
  const s = value.trim();
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!m) return undefined;
  const [, y, mo, d, h, min, sec = "0"] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(min),
    Number(sec),
  );
}

function normalizeDateToMinute(d: Date): Date {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    0,
    0,
  );
}

/** Minutos decorridos (precisão de minuto) entre abertura e fechamento; sem fechamento, usa `agora`. */
function minutosDuracaoProducaoApi(
  abertura: string | null | undefined,
  fechamento: string | null | undefined,
  agora: Date,
): number | null {
  const dAb = parseDataHoraProducaoApi(abertura);
  if (!dAb) return null;
  const dFe = fechamento?.trim()
    ? parseDataHoraProducaoApi(fechamento)
    : undefined;
  const inicio = normalizeDateToMinute(dAb);
  const fim = normalizeDateToMinute(dFe ?? agora);
  return Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 60000));
}

function minutosDuracaoEdicao(
  abertura: Date | undefined,
  fechamento: Date | undefined,
  agora: Date,
): number | null {
  if (!abertura) return null;
  const inicio = normalizeDateToMinute(abertura);
  const fim = normalizeDateToMinute(fechamento ?? agora);
  return Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 60000));
}

function formatDuracaoMinutos(minutos: number | null): string {
  if (minutos == null) return "—";
  return formatMinutosHoraEMinutos(minutos);
}

/** Aplica máscara HH:MM (00:00) no valor do input de tempo estimado */
function maskHHMM(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length === 3) return `${digits.slice(0, 2)}:${digits.slice(2, 3)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

/**
 * Converte o tempo informado no input (HH:MM) para o formato de data esperado pela API:
 * YYYY-MM-DD HH:mm:ss (usa a data atual para a parte da data).
 */
function buildTempoEstimadoParaApi(
  hhmm: string | null | undefined,
): string | null {
  if (!hhmm?.trim()) return null;
  const trimmed = hhmm.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, h, m] = match;
  const now = new Date();
  const y = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = h.padStart(2, "0");
  return `${y}-${month}-${day} ${hour}:${m}:00`;
}

/** Intervalo para atualizar duração e métricas de produções em aberto (ms). */
const PRODUCAO_TEMPO_ATUALIZACAO_MS = 1000;

export function AbaProducao({
  casoId,
  item,
  onSaveProducao,
  onProducaoAlterada,
  isSaving = false,
}: AbaProducaoProps) {
  const caso = item?.caso;
  const tempos = caso?.tempos;
  const naoPlanejadoFlag = caso?.flags?.nao_planejado ?? false;
  const producaoList = useMemo(
    () => (Array.isArray(caso?.producao) ? caso.producao : []),
    [caso?.producao],
  );
  const hasProducao =
    naoPlanejadoFlag ||
    producaoList.length > 0 ||
    (caso?.quantidades_apontadas?.producao ?? 0) > 0;

  const [tempoTick, setTempoTick] = useState(0);
  const agoraAtual = useMemo(() => {
    void tempoTick;
    return new Date();
  }, [tempoTick]);

  const temProducaoAbertaNaLista = useMemo(
    () =>
      producaoList.some(
        (row) =>
          Boolean(row.datas?.abertura?.trim()) &&
          !row.datas?.fechamento?.trim(),
      ),
    [producaoList],
  );

  const estimadoMin = tempos?.estimado_minutos ?? 0;
  const realizadoMinBase = tempos?.realizado_minutos ?? 0;
  const desenvolvendoMinBase = tempos?.desenvolvendo_minutos ?? 0;
  const testandoMinBase = tempos?.testando_minutos ?? 0;

  /**
   * Métricas derivadas da mesma regra da coluna Duração (soma das linhas).
   * Evita duplicar tempo que a API já inclui em desenvolvendo_* / realizado_*.
   */
  const minutosAgregadosDaLista = useMemo(() => {
    let realizado = 0;
    let desenvolvendo = 0;
    let testando = 0;
    for (const row of producaoList) {
      const mins = minutosDuracaoProducaoApi(
        row.datas?.abertura,
        row.datas?.fechamento,
        agoraAtual,
      );
      if (mins == null) continue;
      realizado += mins;
      if (isProducaoTipoTeste(row.tipo)) {
        testando += mins;
      } else {
        desenvolvendo += mins;
      }
    }
    return { realizado, desenvolvendo, testando };
  }, [producaoList, agoraAtual]);

  const usarMetricasDaLista = producaoList.length > 0;

  const realizadoMin = usarMetricasDaLista
    ? minutosAgregadosDaLista.realizado
    : realizadoMinBase;
  const desenvolvendoMin = usarMetricasDaLista
    ? minutosAgregadosDaLista.desenvolvendo
    : desenvolvendoMinBase;
  const testandoMin = usarMetricasDaLista
    ? minutosAgregadosDaLista.testando
    : testandoMinBase;

  const [showForm, setShowForm] = useState(
    estimadoMin === 0 && !naoPlanejadoFlag,
  );
  const [naoPlanejado, setNaoPlanejado] = useState(naoPlanejadoFlag);
  const [tamanhoId, setTamanhoId] = useState<string>("");
  const [tempoEstimado, setTempoEstimado] = useState("");
  const [editandoSequencia, setEditandoSequencia] = useState<number | null>(
    null,
  );
  const [editandoTipo, setEditandoTipo] = useState("");
  const [editandoAbertura, setEditandoAbertura] = useState<Date | undefined>(
    undefined,
  );
  const [editandoFechamento, setEditandoFechamento] = useState<
    Date | undefined
  >(undefined);
  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({ open: false, sequencia: 0 });

  const edicaoComTempoAberto =
    editandoSequencia != null &&
    editandoAbertura != null &&
    editandoFechamento == null;

  useEffect(() => {
    if (!temProducaoAbertaNaLista && !edicaoComTempoAberto) return;
    const id = window.setInterval(() => {
      setTempoTick((n) => n + 1);
    }, PRODUCAO_TEMPO_ATUALIZACAO_MS);
    return () => window.clearInterval(id);
  }, [temProducaoAbertaNaLista, edicaoComTempoAberto]);

  const atualizarProducao = useAtualizarProducao();
  const excluirProducao = useExcluirProducao();

  useEffect(() => {
    if (showForm) {
      setNaoPlanejado(naoPlanejadoFlag);
      setTamanhoId(
        caso?.caracteristicas?.tamanho_pontos != null
          ? String(caso.caracteristicas.tamanho_pontos)
          : "",
      );
      const min = tempos?.estimado_minutos ?? 0;
      if (min > 0) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        setTempoEstimado(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        );
      } else {
        setTempoEstimado("");
      }
    }
  }, [
    showForm,
    naoPlanejadoFlag,
    caso?.caracteristicas?.tamanho_pontos,
    tempos?.estimado_minutos,
  ]);

  const handleSalvar = async () => {
    const payload: AbaProducaoSavePayload = {
      NaoPlanejado: naoPlanejado ? 1 : 0,
      TempoEstimado: naoPlanejado
        ? null
        : buildTempoEstimadoParaApi(tempoEstimado),
      tamanho: naoPlanejado ? null : tamanhoId ? Number(tamanhoId) : null,
    };
    await onSaveProducao(payload);
    setShowForm(false);
  };

  const handleIniciarEdicao = (row: ProducaoDetalheItem) => {
    setEditandoSequencia(row.sequencia);
    setEditandoTipo(row.tipo ?? "");
    setEditandoAbertura(apiStringToDate(row.datas?.abertura ?? null));
    setEditandoFechamento(apiStringToDate(row.datas?.fechamento ?? null));
  };

  const handleCancelarEdicao = () => {
    setEditandoSequencia(null);
    setEditandoTipo("");
    setEditandoAbertura(undefined);
    setEditandoFechamento(undefined);
  };

  const handleSalvarEdicao = async () => {
    if (editandoSequencia == null) return;
    await atualizarProducao.mutateAsync({
      sequencia: editandoSequencia,
      payload: {
        tipo_producao: editandoTipo.trim() || undefined,
        hora_abertura: dateTimeToApiString(editandoAbertura),
        hora_fechamento: dateTimeToApiString(editandoFechamento),
      },
    });
    handleCancelarEdicao();
    onProducaoAlterada?.();
  };

  const handleExcluirConfirm = async () => {
    if (!excluirModal.open) return;
    await excluirProducao.mutateAsync(excluirModal.sequencia);
    setExcluirModal({ open: false, sequencia: 0 });
    onProducaoAlterada?.();
  };

  return (
    <>
      <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
        <CasoEditCardHeader title="Produção" icon={Package} badge={casoId} />
        <CardContent className="p-6 pt-3 flex flex-col lg:flex-1 ">
          {/* Bloco único "Lançar Produção": título, descrição, botão e (quando em modo form) formulário */}
          <div className="shrink-0 p-5 rounded-lg border border-border-divider bg-muted/30 space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Lançar estimativa
                </h3>
                <p className="text-sm text-text-secondary">
                  Registre uma estimativa de tempo para o caso
                </p>
              </div>
              {!showForm ? (
                <Button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto shrink-0"
                >
                  {estimadoMin ? "Alterar estimativa" : "Lançar estimativa"}
                </Button>
              ) : null}
            </div>

            {showForm && (
              <>
                <div className="rounded-lg bg-sky-50 dark:bg-sky-950/30 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="nao-planejado"
                      checked={naoPlanejado}
                      onCheckedChange={(v) => setNaoPlanejado(Boolean(v))}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="nao-planejado"
                        className="text-sm font-medium text-text-primary cursor-pointer"
                      >
                        Não planejado
                      </Label>
                      <p className="text-xs text-text-secondary">
                        Marque se este caso não foi planejado (dispensa controle
                        de tempo).
                      </p>
                    </div>
                  </div>
                </div>

                {!naoPlanejado && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TamanhoCombobox
                      value={tamanhoId}
                      onValueChange={(v) => setTamanhoId(v ?? "")}
                      onTamanhoSelect={(_id, tempoHHMM) =>
                        setTempoEstimado(tempoHHMM)
                      }
                      disabled={isSaving}
                    />
                    <div className="space-y-2">
                      <Label
                        htmlFor="tempo-estimado"
                        className="text-sm font-medium text-text-label"
                      >
                        Tempo estimado
                      </Label>
                      <Input
                        id="tempo-estimado"
                        type="text"
                        placeholder="HH:MM (ex: 01:30)"
                        value={tempoEstimado}
                        onChange={(e) =>
                          setTempoEstimado(maskHHMM(e.target.value))
                        }
                        disabled={isSaving}
                        maxLength={5}
                        className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSalvar}
                    disabled={isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Controle de Produção e detalhes sempre visíveis; hasProducao decide entre tabela ou EmptyState */}
          <div className="space-y-6 pt-4 ">
            {/* Card Controle de Produção - sempre visível quando não está no form */}
            <div className="bg-card rounded-lg border border-border-divider p-5 space-y-4 bg-sky-100">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  Controle de Produção
                </h3>
                {naoPlanejadoFlag && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked
                      disabled
                      className="pointer-events-none"
                    />
                    <span className="text-xs text-text-secondary">
                      Não planejado
                    </span>
                  </div>
                )}
              </div>

              {naoPlanejadoFlag ? (
                /* 2.2: 3 métricas */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ProducaoMetricaCard
                    label={
                      realizadoMin < 60
                        ? "Total minutos produção"
                        : "Total horas produção"
                    }
                    value={formatMinutosHoraEMinutos(realizadoMin)}
                    valueVariant="sky"
                  />
                  <ProducaoMetricaCard
                    label={
                      desenvolvendoMin < 60
                        ? "Total minutos desenvolvidos"
                        : "Total horas desenvolvidas"
                    }
                    value={formatMinutosHoraEMinutos(desenvolvendoMin)}
                    valueVariant="purple"
                  />
                  <ProducaoMetricaCard
                    label={
                      testandoMin < 60
                        ? "Total minutos de teste"
                        : "Total horas teste"
                    }
                    value={formatMinutosHoraEMinutos(testandoMin)}
                  />
                </div>
              ) : (
                /* 2.1: 5 métricas */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <ProducaoMetricaCard
                    label={
                      estimadoMin < 60
                        ? "Total minutos estimado"
                        : "Total horas estimado"
                    }
                    value={formatMinutosHoraEMinutos(estimadoMin)}
                  />

                  <ProducaoMetricaCard
                    label={
                      realizadoMin < 60
                        ? "Total Minutos desenvolvidos"
                        : "Total horas desenvolvidas"
                    }
                    value={formatMinutosHoraEMinutos(desenvolvendoMin)}
                    valueVariant="sky"
                  />

                  <ProducaoMetricaCard
                    label={
                      desenvolvendoMin > estimadoMin
                        ? "Tempo excedido"
                        : "Tempo dentro do estimado"
                    }
                    value={formatMinutosHoraEMinutos(
                      Math.abs(desenvolvendoMin - estimadoMin),
                    )}
                    valueVariant={
                      desenvolvendoMin > estimadoMin ? "destructive" : "default"
                    }
                  />

                  <ProducaoMetricaCard
                    label={
                      testandoMin < 60
                        ? "Total minutos de teste"
                        : "Total horas teste"
                    }
                    value={formatMinutosHoraEMinutos(testandoMin)}
                    valueVariant="sky"
                  />

                  <ProducaoMetricaCard
                    label="Tempo Produção"
                    value={formatMinutosHoraEMinutos(realizadoMin)}
                    valueVariant="sky"
                  />
                </div>
              )}
            </div>

            {/* hasProducao: exibe tabela; !hasProducao: exibe EmptyState */}
            {hasProducao ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  Detalhes da produção
                </h3>
                {producaoList.length === 0 ? (
                  <p className="text-sm text-text-secondary py-4">
                    Nenhum detalhe de produção registrado.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white border-b border-white hover:bg-white">
                        <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Abertura
                        </TableHead>
                        <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Fechamento
                        </TableHead>
                        <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 whitespace-nowrap">
                          Duração
                        </TableHead>
                        <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Tipo
                        </TableHead>
                        <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Projeto
                        </TableHead>
                        <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Usuário
                        </TableHead>
                        <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 w-[120px]">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {producaoList.map((row) => (
                        <TableRow
                          key={row.sequencia}
                          className="bg-white border-t border-border-divider hover:bg-white"
                        >
                          <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                            {editandoSequencia === row.sequencia ? (
                              <DateTimePicker
                                value={editandoAbertura}
                                onChange={setEditandoAbertura}
                                placeholder="Abertura"
                                disabled={atualizarProducao.isPending}
                                className="min-w-[180px]"
                              />
                            ) : (
                              formatDataHoraProducao(row.datas?.abertura)
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                            {editandoSequencia === row.sequencia ? (
                              <DateTimePicker
                                value={editandoFechamento}
                                onChange={setEditandoFechamento}
                                placeholder="Fechamento"
                                disabled={atualizarProducao.isPending}
                                className="min-w-[180px]"
                              />
                            ) : (
                              formatDataHoraProducao(row.datas?.fechamento)
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-2.5 text-sm text-text-primary whitespace-nowrap">
                            {editandoSequencia === row.sequencia
                              ? formatDuracaoMinutos(
                                  minutosDuracaoEdicao(
                                    editandoAbertura,
                                    editandoFechamento,
                                    agoraAtual,
                                  ),
                                )
                              : formatDuracaoMinutos(
                                  minutosDuracaoProducaoApi(
                                    row.datas?.abertura,
                                    row.datas?.fechamento,
                                    agoraAtual,
                                  ),
                                )}
                          </TableCell>
                          <TableCell className="py-3 px-2.5">
                            {editandoSequencia === row.sequencia ? (
                              <Input
                                type="text"
                                value={editandoTipo}
                                onChange={(e) =>
                                  setEditandoTipo(e.target.value)
                                }
                                placeholder="Tipo"
                                className="h-9 text-sm"
                                disabled={atualizarProducao.isPending}
                              />
                            ) : row.tipo ? (
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-sky-100 text-sky-700 border-transparent"
                              >
                                {row.tipo}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                            {row.projeto_id != null
                              ? String(row.projeto_id)
                              : "—"}
                          </TableCell>
                          <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                            {row.usuario_nome ?? "—"}
                          </TableCell>
                          <TableCell className="py-3 px-2.5">
                            {editandoSequencia === row.sequencia ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelarEdicao}
                                  className="rounded-lg"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleSalvarEdicao}
                                  disabled={atualizarProducao.isPending}
                                  className="rounded-lg"
                                >
                                  {atualizarProducao.isPending
                                    ? "Salvando..."
                                    : "Salvar"}
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-9 rounded-lg"
                                  onClick={() => handleIniciarEdicao(row)}
                                  aria-label="Editar produção"
                                >
                                  <Pencil className="size-4 text-foreground" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="size-9 rounded-lg text-destructive hover:text-destructive"
                                  onClick={() =>
                                    setExcluirModal({
                                      open: true,
                                      sequencia: row.sequencia,
                                    })
                                  }
                                  aria-label="Excluir produção"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <EmptyState
                  icon={Package}
                  imageAlt="Nenhuma produção lançada"
                  title="Nenhuma produção lançada"
                  description="Clique em novo lançamento para lançar uma produção."
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmacaoModal
        open={excluirModal.open}
        onOpenChange={(open) =>
          !open && setExcluirModal({ open: false, sequencia: 0 })
        }
        titulo="Excluir produção"
        descricao="Tem certeza que deseja excluir esta produção? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={excluirProducao.isPending}
      />
    </>
  );
}
