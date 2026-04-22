"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { EmptyState } from "@/components/painel/empty-state";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { DateTimePicker, apiStringToDate, dateTimeToApiString } from "@/components/ui/date-picker";
import { useAtualizarProducao } from "@/hooks/use-atualizar-producao";
import { useExcluirProducao } from "@/hooks/use-excluir-producao";
import { Package } from "lucide-react";
import type { AbaProducaoProps } from "./types";
import {
  hasProducaoAberta,
  isProducaoTipoTeste,
  minutosDuracaoProducaoApi,
  parseDataHoraProducaoApi,
} from "./utils";
import { ProducaoEstimativa } from "./producao-estimativa";
import { ProducaoControle } from "./producao-controle";
import { ProducaoDetalhes } from "./producao-detalhes";

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
    () => hasProducaoAberta(producaoList),
    [producaoList],
  );

  const estimadoMin = tempos?.estimado_minutos ?? 0;
  const realizadoMinBase = tempos?.realizado_minutos ?? 0;
  const desenvolvendoMinBase = tempos?.desenvolvendo_minutos ?? 0;
  const testandoMinBase = tempos?.testando_minutos ?? 0;

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
    if (!showForm) return;
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
      setTempoEstimado(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    } else {
      setTempoEstimado("");
    }
  }, [showForm, naoPlanejadoFlag, caso?.caracteristicas?.tamanho_pontos, tempos?.estimado_minutos]);

  const handleIniciarEdicao = (row: (typeof producaoList)[number]) => {
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

  const [excluirModal, setExcluirModal] = useState<{
    open: boolean;
    sequencia: number;
  }>({ open: false, sequencia: 0 });

  const handleExcluirConfirm = async () => {
    if (!excluirModal.open) return;
    await excluirProducao.mutateAsync(excluirModal.sequencia);
    setExcluirModal({ open: false, sequencia: 0 });
    onProducaoAlterada?.();
  };

  void DateTimePicker;
  void parseDataHoraProducaoApi;

  return (
    <>
      <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
        <CasoEditCardHeader title="Produção" icon={Package} badge={casoId} />
        <CardContent className="p-6 pt-3 flex flex-col lg:flex-1 ">
          <ProducaoEstimativa
            showForm={showForm}
            setShowForm={setShowForm}
            isSaving={isSaving}
            naoPlanejado={naoPlanejado}
            setNaoPlanejado={setNaoPlanejado}
            naoPlanejadoFlag={naoPlanejadoFlag}
            tamanhoId={tamanhoId}
            setTamanhoId={setTamanhoId}
            tempoEstimado={tempoEstimado}
            setTempoEstimado={setTempoEstimado}
            estimadoMin={estimadoMin}
            onSaveProducao={onSaveProducao}
          />

          <div className="space-y-6 pt-4 ">
            <ProducaoControle
              naoPlanejadoFlag={naoPlanejadoFlag}
              estimadoMin={estimadoMin}
              realizadoMin={realizadoMin}
              desenvolvendoMin={desenvolvendoMin}
              testandoMin={testandoMin}
            />

            {hasProducao ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  Detalhes da produção
                </h3>
                <ProducaoDetalhes
                  producaoList={producaoList}
                  agoraAtual={agoraAtual}
                  editandoSequencia={editandoSequencia}
                  editandoTipo={editandoTipo}
                  editandoAbertura={editandoAbertura}
                  editandoFechamento={editandoFechamento}
                  onEditandoTipoChange={setEditandoTipo}
                  onEditandoAberturaChange={setEditandoAbertura}
                  onEditandoFechamentoChange={setEditandoFechamento}
                  isSalvandoEdicao={atualizarProducao.isPending}
                  onIniciarEdicao={handleIniciarEdicao}
                  onCancelarEdicao={handleCancelarEdicao}
                  onSalvarEdicao={handleSalvarEdicao}
                  onAskDelete={(sequencia) =>
                    setExcluirModal({ open: true, sequencia })
                  }
                />
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

