"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useProjetos } from "@/hooks/catalogos/use-projetos";
import {
  useProductionAnalysis,
  type ProductionAnalysisParams,
} from "@/hooks/producao/use-production-analysis";
import { getUser } from "@/lib/auth";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { AuditoriaFiltros } from "./auditoria-filtros";
import { AuditoriaSummaryCards } from "./auditoria-summary-cards";
import { AuditoriaColaboradoresTable } from "./auditoria-colaboradores-table";
import { AuditoriaEmptyState } from "./auditoria-empty-state";
import { AuditoriaResultsSkeleton } from "./auditoria-results-skeleton";
import type { AuditoriaFiltersForm } from "./types";
import {
  dateToYmdString,
  getTodayDate,
  JANELA_FIM_PADRAO,
  JANELA_INICIO_PADRAO,
} from "./utils";

export function AuditoriaSquad() {
  const rbacReady = permissionsLoaded();
  const canAuditAllUsers = !rbacReady || hasPermission("audit-all-users");
  const loggedUser = getUser();
  const loggedUserId = loggedUser?.id;
  const loggedUserNome = loggedUser?.nome ?? "";

  const form = useForm<AuditoriaFiltersForm>({
    defaultValues: {
      projeto: "",
      devAtribuido: "",
      devAtribuidoLabel: "",
    },
  });
  const { setValue, getValues } = form;
  const [dataProducao, setDataProducao] = useState<Date | undefined>(
    getTodayDate(),
  );
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<ProductionAnalysisParams | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const projetoSelecionado = form.watch("projeto")?.trim() ?? "";
  const colaboradorSelecionado = form.watch("devAtribuido")?.trim() ?? "";
  const dataProducaoYmd = useMemo(
    () => dateToYmdString(dataProducao) ?? "",
    [dataProducao],
  );

  useEffect(() => {
    if (!rbacReady || canAuditAllUsers || loggedUserId == null) return;

    const expectedId = String(loggedUserId);
    const current = getValues();

    if (
      current.devAtribuido === expectedId &&
      current.devAtribuidoLabel === loggedUserNome &&
      !current.projeto
    ) {
      return;
    }

    setValue("devAtribuido", expectedId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValue("devAtribuidoLabel", loggedUserNome, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    if (current.projeto) {
      setValue("projeto", "", {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [
    rbacReady,
    canAuditAllUsers,
    loggedUserId,
    loggedUserNome,
    getValues,
    setValue,
  ]);
  const { data: projetos } = useProjetos({
    enabled: canAuditAllUsers && Boolean(projetoSelecionado),
  });

  const projetoLabel = useMemo(() => {
    if (!canAuditAllUsers || !projetoSelecionado || !projetos?.length) {
      return "";
    }
    const found = projetos.find((p) => String(p.id) === projetoSelecionado);
    if (!found) return projetoSelecionado;
    return `${found.id} | ${found.nome_projeto}`;
  }, [canAuditAllUsers, projetoSelecionado, projetos]);

  const usuarioAuditoria = canAuditAllUsers
    ? colaboradorSelecionado
    : String(loggedUserId ?? colaboradorSelecionado);

  const canAudit = canAuditAllUsers
    ? Boolean((dataProducaoYmd && projetoSelecionado) || usuarioAuditoria)
    : Boolean(dataProducaoYmd && usuarioAuditoria);
  const query = useProductionAnalysis(filtrosAplicados ?? undefined, {
    enabled: false,
  });
  const { refetch } = query;

  useEffect(() => {
    if (!filtrosAplicados) return;
    void refetch().finally(() => setIsAuditing(false));
  }, [filtrosAplicados, refetch]);

  const handleAuditar = () => {
    if (!canAudit) return;

    setIsAuditing(true);
    setFiltrosAplicados({
      data_producao_inicio: dataProducaoYmd,
      data_producao_fim: dataProducaoYmd,
      janela_inicio: JANELA_INICIO_PADRAO,
      fim: JANELA_FIM_PADRAO,
      usuario: usuarioAuditoria,
      ...(canAuditAllUsers && projetoSelecionado
        ? { projeto_id: projetoSelecionado }
        : {}),
    });
  };

  const handleLimparFiltros = () => {
    if (canAuditAllUsers) {
      form.reset({
        projeto: "",
        devAtribuido: "",
        devAtribuidoLabel: "",
      });
    } else if (loggedUser) {
      form.reset({
        projeto: "",
        devAtribuido: String(loggedUser.id),
        devAtribuidoLabel: loggedUser.nome,
      });
    } else {
      form.reset({
        projeto: "",
        devAtribuido: "",
        devAtribuidoLabel: "",
      });
    }
    setDataProducao(getTodayDate());
    setFiltrosAplicados(null);
    setIsAuditing(false);
  };

  const isLoadingResults = isAuditing || query.isLoading || query.isFetching;
  const semAuditoria = !filtrosAplicados;
  const colaboradores = query.data?.data.colaboradores ?? [];
  const resumoSquad = query.data?.data.resumo_squad;
  const semResultados =
    Boolean(filtrosAplicados) &&
    !isLoadingResults &&
    colaboradores.length === 0;
  const mostrarResultados =
    Boolean(filtrosAplicados) && !isLoadingResults && colaboradores.length > 0;

  return (
    <ListagemPageLayout
      title="Auditoria Squad"
      subtitle="Acompanhamento de horas e inconsistências"
      actions={
        <Button
          variant="outline"
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          onClick={handleLimparFiltros}
        >
          <FilterX className="h-3.5 w-3.5" />
          Limpar Filtros
        </Button>
      }
    >
      <div className="flex w-full flex-col gap-2">
        <AuditoriaFiltros
          form={form}
          dataProducao={dataProducao}
          onDataProducaoChange={setDataProducao}
          canAuditAllUsers={canAuditAllUsers}
          canAudit={canAudit}
          isFetching={query.isFetching}
          onAuditar={handleAuditar}
        />

        {semAuditoria ? (
          <AuditoriaEmptyState variant="sem_auditoria" />
        ) : isLoadingResults ? (
          <AuditoriaResultsSkeleton />
        ) : semResultados ? (
          <AuditoriaEmptyState variant="sem_resultados" />
        ) : mostrarResultados && resumoSquad ? (
          <div className="flex w-full flex-col gap-2">
            <AuditoriaSummaryCards resumo={resumoSquad} />
            <AuditoriaColaboradoresTable
              colaboradores={colaboradores}
              projetoLabel={projetoLabel}
            />
          </div>
        ) : null}

        {query.error ? (
          <p className="text-sm text-destructive" role="alert">
            {query.error instanceof Error
              ? query.error.message
              : "Não foi possível realizar a auditoria."}
          </p>
        ) : null}
      </div>
    </ListagemPageLayout>
  );
}
