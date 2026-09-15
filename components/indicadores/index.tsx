"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useColaboradoresIndicadores } from "@/hooks/rh/use-colaboradores-indicadores";
import { useRecalcularIndicadoresTodos } from "@/hooks/rh/use-recalcular-indicadores-todos";
import { useUpdateIndicadorBaseline } from "@/hooks/rh/use-update-indicador-baseline";
import { getUser } from "@/lib/auth";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import type { ColaboradorIndicador } from "@/services/rh/get-colaboradores-indicadores";
import { IndicadoresFiltros } from "./indicadores-filtros";
import { IndicadoresPremiacao } from "./indicadores-premiacao";
import { IndicadoresColuna } from "./indicadores-coluna";
import { IndicadoresMobileTabs } from "./indicadores-mobile-tabs";
import { IndicadoresDetalheDialog } from "./indicadores-detalhe-dialog";
import { IndicadoresRecalcularTodosDialog } from "./indicadores-recalcular-todos-dialog";
import { IndicadoresSkeleton } from "./indicadores-skeleton";
import type { IndicadorAtalho, IndicadoresFiltrosForm } from "./types";
import {
  computePremiacao,
  dateToYmdString,
  formatMoney,
  formatPeriodoLabel,
  getCurrentMonthRange,
  getPreviousMonthRange,
  splitIndicadores,
} from "./utils";

export function Indicadores() {
  const rbacReady = permissionsLoaded();
  const canViewOthers = !rbacReady || hasPermission("list-indicadores-all");
  const loggedUser = getUser();
  const loggedUserId = loggedUser?.id != null ? String(loggedUser.id) : "";
  const loggedUserNome = loggedUser?.nome ?? "";

  const mesAtual = useMemo(() => getCurrentMonthRange(), []);
  const [dataInicial, setDataInicial] = useState<Date | undefined>(mesAtual.start);
  const [dataFinal, setDataFinal] = useState<Date | undefined>(mesAtual.end);
  const [atalho, setAtalho] = useState<IndicadorAtalho | null>("mes-atual");
  const [selectedItem, setSelectedItem] = useState<ColaboradorIndicador | null>(
    null,
  );

  const form = useForm<IndicadoresFiltrosForm>({
    defaultValues: {
      devAtribuido: loggedUserId,
      devAtribuidoLabel: loggedUserNome,
    },
  });
  const { setValue, getValues, watch } = form;
  const colaboradorSelecionado = watch("devAtribuido")?.trim() ?? "";

  useEffect(() => {
    if (!loggedUserId) return;
    const current = getValues();
    const shouldLockToSelf = !canViewOthers;
    const missingSelection = !current.devAtribuido;

    if (!shouldLockToSelf && !missingSelection) return;
    if (
      current.devAtribuido === loggedUserId &&
      current.devAtribuidoLabel === loggedUserNome
    ) {
      return;
    }

    setValue("devAtribuido", loggedUserId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValue("devAtribuidoLabel", loggedUserNome, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [
    canViewOthers,
    getValues,
    loggedUserId,
    loggedUserNome,
    setValue,
  ]);

  const suporteId = canViewOthers
    ? colaboradorSelecionado || loggedUserId
    : loggedUserId;
  const dataInicialYmd = dateToYmdString(dataInicial) ?? "";
  const dataFinalYmd = dateToYmdString(dataFinal) ?? "";

  const query = useColaboradoresIndicadores({
    suporte_id: suporteId,
    data_inicial: dataInicialYmd,
    data_final: dataFinalYmd,
  });
  const recalc = useUpdateIndicadorBaseline();
  const recalcTodos = useRecalcularIndicadoresTodos();

  const items = query.data?.data ?? [];
  const { alcancou, resta } = splitIndicadores(items);
  const premiacao = computePremiacao(items);
  const periodoLabel = formatPeriodoLabel(dataInicialYmd, dataFinalYmd);
  const isLoading =
    !suporteId ||
    query.isLoading ||
    (query.isFetching && !query.data);
  const recalculatingId = recalc.isPending
    ? (recalc.variables?.id ?? null)
    : null;

  useEffect(() => {
    setSelectedItem((current) => (current == null ? current : null));
  }, [suporteId, dataInicialYmd, dataFinalYmd]);

  useEffect(() => {
    if (!selectedItem) return;
    const updated = items.find((item) => item.id === selectedItem.id);
    if (updated && updated !== selectedItem) {
      setSelectedItem(updated);
    }
  }, [items, selectedItem]);

  const handleDataInicialChange = (date: Date | undefined) => {
    setDataInicial(date);
    setAtalho(null);
  };

  const handleDataFinalChange = (date: Date | undefined) => {
    setDataFinal(date);
    setAtalho(null);
  };

  const handleAtalho = (proximo: IndicadorAtalho) => {
    setAtalho(proximo);
    if (proximo === "mes-atual") {
      const range = getCurrentMonthRange();
      setDataInicial(range.start);
      setDataFinal(range.end);
      return;
    }
    if (proximo === "mes-anterior") {
      const range = getPreviousMonthRange();
      setDataInicial(range.start);
      setDataFinal(range.end);
      return;
    }
    if (!loggedUserId) return;
    setValue("devAtribuido", loggedUserId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValue("devAtribuidoLabel", loggedUserNome, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  };

  const handleRecalcular = (item: ColaboradorIndicador) => {
    if (!suporteId || !dataInicialYmd || !dataFinalYmd) return;
    if (recalcTodos.running) return;
    recalc.mutate(
      {
        id: item.id,
        indicador_id: item.indicador_id,
        pilha: false,
        suporte_id: Number(suporteId),
        data_inicial: dataInicialYmd,
        data_final: dataFinalYmd,
        pdv: item.pdv,
        setor: item.setor,
      },
      {
        onSuccess: () => toast.success("Indicador recalculado"),
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Erro ao recalcular indicador",
          );
        },
      },
    );
  };

  return (
    <ListagemPageLayout
      title="Indicadores"
      subtitle="Premiação e metas do período"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={
              isLoading || items.length === 0 || recalcTodos.running
            }
            onClick={() => {
              if (!suporteId || !dataInicialYmd || !dataFinalYmd) return;
              void recalcTodos.start(items, {
                suporte_id: Number(suporteId),
                data_inicial: dataInicialYmd,
                data_final: dataFinalYmd,
              });
            }}
          >
            {recalcTodos.running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recalcular todos
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isLoading || query.isFetching || recalcTodos.running}
            onClick={() => void query.refetch()}
          >
            {query.isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-2">
        <IndicadoresFiltros
          form={form}
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          onDataInicialChange={handleDataInicialChange}
          onDataFinalChange={handleDataFinalChange}
          canViewOthers={canViewOthers}
          atalho={atalho}
          onAtalho={handleAtalho}
        />

        {isLoading ? (
          <IndicadoresSkeleton />
        ) : (
          <>
            <IndicadoresPremiacao
              premiacao={premiacao}
              periodoLabel={periodoLabel}
            />

            <div className="mt-4 hidden grid-cols-2 gap-6 lg:grid lg:items-start">
              <IndicadoresColuna
                variant="alcancou"
                items={alcancou}
                somaLabel={
                  alcancou.length
                    ? `${formatMoney(premiacao.alcancado)} garantidos`
                    : ""
                }
                recalculatingId={recalculatingId}
                onDetalhe={setSelectedItem}
                onRecalcular={handleRecalcular}
              />
              <IndicadoresColuna
                variant="resta"
                items={resta}
                somaLabel={
                  resta.length
                    ? `${formatMoney(premiacao.emAberto)} em aberto`
                    : ""
                }
                recalculatingId={recalculatingId}
                onDetalhe={setSelectedItem}
                onRecalcular={handleRecalcular}
              />
            </div>

            <div className="mt-4 lg:hidden">
              <IndicadoresMobileTabs
                alcancou={alcancou}
                resta={resta}
                recalculatingId={recalculatingId}
                onDetalhe={setSelectedItem}
                onRecalcular={handleRecalcular}
              />
            </div>
          </>
        )}

        {query.error ? (
          <p className="text-sm text-destructive" role="alert">
            {query.error instanceof Error
              ? query.error.message
              : "Não foi possível carregar os indicadores."}
          </p>
        ) : null}
      </div>

      <IndicadoresDetalheDialog
        item={selectedItem}
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        periodoLabel={periodoLabel}
        isRecalculating={
          Boolean(selectedItem) && recalculatingId === selectedItem?.id
        }
        onRecalcular={handleRecalcular}
      />

      <IndicadoresRecalcularTodosDialog
        open={recalcTodos.open}
        running={recalcTodos.running}
        linhas={recalcTodos.linhas}
        premiacao={premiacao}
        onAtualizarTela={() => {
          recalcTodos.close();
          toast.success("Números atualizados");
        }}
        onClose={recalcTodos.close}
      />
    </ListagemPageLayout>
  );
}
