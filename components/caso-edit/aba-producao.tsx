"use client";

import { useState, useEffect } from "react";
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
import { Package } from "lucide-react";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

export interface AbaProducaoSavePayload {
  TempoEstimado?: string | null;
  tamanho?: number | null;
  NaoPlanejado?: number | boolean;
}

export interface AbaProducaoProps {
  casoId: number;
  item: ProjetoMemoriaItem;
  onSaveProducao: (payload: AbaProducaoSavePayload) => Promise<void>;
  isSaving?: boolean;
}

function formatMinutos(minutos: number): string {
  if (minutos === 0) return "0 minutos";
  return `${minutos} minutos`;
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

export function AbaProducao({
  casoId,
  item,
  onSaveProducao,
  isSaving = false,
}: AbaProducaoProps) {
  const caso = item?.caso;
  const tempos = caso?.tempos;
  const naoPlanejadoFlag = caso?.flags?.nao_planejado ?? false;
  const producaoList = Array.isArray(caso?.producao) ? caso.producao : [];
  const hasProducao =
    naoPlanejadoFlag ||
    producaoList.length > 0 ||
    (caso?.quantidades_apontadas?.producao ?? 0) > 0;

  const estimadoMin = tempos?.estimado_minutos ?? 0;
  const realizadoMin = tempos?.realizado_minutos ?? 0;
  const desenvolvendoMin = tempos?.desenvolvendo_minutos ?? 0;
  const testandoMin = tempos?.testando_minutos ?? 0;

  const [showForm, setShowForm] = useState(
    estimadoMin === 0 && !naoPlanejadoFlag,
  );
  const [naoPlanejado, setNaoPlanejado] = useState(naoPlanejadoFlag);
  const [tamanhoId, setTamanhoId] = useState<string>("");
  const [tempoEstimado, setTempoEstimado] = useState("");

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

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
      <CasoEditCardHeader title="Produção" icon={Package} badge={casoId} />
      <CardContent className="p-6 pt-3 flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
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
                  <Checkbox checked disabled className="pointer-events-none" />
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
                  label="Tempo Produção"
                  value={formatMinutos(realizadoMin)}
                  valueVariant="sky"
                />
                <ProducaoMetricaCard
                  label="Total horas desenvolvidas"
                  value={formatMinutos(desenvolvendoMin)}
                  valueVariant="purple"
                />
                <ProducaoMetricaCard
                  label="Total horas teste"
                  value={formatMinutos(testandoMin)}
                />
              </div>
            ) : (
              /* 2.1: 5 métricas */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <ProducaoMetricaCard
                  label="Tempo Estimado"
                  value={formatMinutos(estimadoMin)}
                />
                <ProducaoMetricaCard
                  label="Tempo Produção"
                  value={formatMinutos(realizadoMin)}
                  valueVariant="sky"
                />
                <ProducaoMetricaCard
                  label="Tempo Excedido"
                  value={formatTempoExcedido(estimadoMin, realizadoMin)}
                  valueVariant={
                    realizadoMin > estimadoMin ? "destructive" : "default"
                  }
                />
                <ProducaoMetricaCard
                  label="Total horas"
                  value={formatMinutos(realizadoMin)}
                  valueVariant="sky"
                />
                <ProducaoMetricaCard
                  label="Total horas teste"
                  value={formatMinutos(testandoMin)}
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
                      <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                        Tipo
                      </TableHead>
                      <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                        Projeto
                      </TableHead>
                      <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                        Usuário
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
                          {formatDataHoraProducao(row.datas?.abertura)}
                        </TableCell>
                        <TableCell className="py-3 px-2.5 text-sm text-text-primary">
                          {formatDataHoraProducao(row.datas?.fechamento)}
                        </TableCell>
                        <TableCell className="py-3 px-2.5">
                          {row.tipo ? (
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
  );
}
