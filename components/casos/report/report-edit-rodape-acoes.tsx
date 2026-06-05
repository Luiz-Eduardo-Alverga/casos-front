"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useSidebar } from "@/components/sidebar/sidebar-provider";
import { useCasoEdit } from "@/components/casos/edicao/caso-edit-context";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import {
  getReportEditRodapeVisibility,
  nowSaoPauloToApiDateTime,
} from "@/components/casos/edicao/report-analise-modal/utils";
import { resolveReportPoQaAtribuidoPara } from "@/lib/report/resolve-report-po-qa-atribuido";
import { getUser } from "@/lib/auth";
import type { UpdateCasoRequest } from "@/services/projeto-casos/update";
import type { ReportEditFormData } from "./schema";

export function ReportEditRodapeAcoes() {
  const { memoriaQueryId, invalidate, canEditCase } = useCasoEdit();
  const { editCaseItem } = useCasoForm();
  const { watch, setValue } = useFormContext<ReportEditFormData>();
  const updateCaso = useUpdateCaso(memoriaQueryId);

  const analiseStatusAtual = String(
    watch("analiseStatus") || editCaseItem?.report?.analise_status || "",
  ).trim();
  const { exibirConcluir, exibirSuspender, exibirRodape } =
    getReportEditRodapeVisibility(analiseStatusAtual);

  const produtoId = String(watch("produto") ?? "").trim();
  const categoriaTipoLabel =
    watch("categoriaTipoLabel") ||
    editCaseItem?.caso?.caracteristicas?.tipo_categoria ||
    "";

  const { data: produtos, isLoading: isProdutosLoading } = useProdutos({
    enabled: Boolean(produtoId),
  });

  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const resolveAtribuidoPara = useCallback((): number | null => {
    const produto = (produtos ?? []).find(
      (item) => String(item.id) === produtoId,
    );
    return resolveReportPoQaAtribuidoPara(produto, categoriaTipoLabel);
  }, [produtos, produtoId, categoriaTipoLabel]);

  const pending = updateCaso.isPending;
  const disabled = pending || !canEditCase;
  const concluirDisabled = disabled || isProdutosLoading || !produtoId;

  const handleConcluirRequisitoPendente = async () => {
    if (isProdutosLoading) {
      toast.error("Carregando dados do produto. Aguarde e tente novamente.");
      return;
    }

    const atribuidoPara = resolveAtribuidoPara();
    if (atribuidoPara == null) {
      toast.error(
        "Não foi possível identificar o PO/QA responsável para este produto e categoria.",
      );
      return;
    }

    const payload: UpdateCasoRequest = {
      status: 1,
      report_analise_status: "0",
      AtribuidoPara: atribuidoPara,
    };

    try {
      await updateCaso.mutateAsync({
        id: memoriaQueryId,
        data: payload,
      });
      setValue("status", "1", { shouldDirty: false });
      setValue("analiseStatus", "", { shouldDirty: false });
      toast.success("Requisito pendente concluído com sucesso.");
      invalidate();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao concluir requisito pendente.",
      );
    }
  };

  const handleSuspender = async () => {
    const userId = getUser()?.id;
    if (userId == null || String(userId).trim() === "") {
      toast.error("Usuário não identificado. Faça login novamente.");
      return;
    }

    const payload: UpdateCasoRequest = {
      status: 10,
      report_analise_status: "23",
      report_analise_data_conclusao: nowSaoPauloToApiDateTime(),
      report_analise_usuario_id: String(userId),
    };

    try {
      await updateCaso.mutateAsync({
        id: memoriaQueryId,
        data: payload,
      });
      setValue("status", "10", { shouldDirty: false });
      setValue("analiseStatus", "23", { shouldDirty: false });
      toast.success("Report suspenso com sucesso.");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao suspender report.");
    }
  };

  if (!exibirRodape) {
    return null;
  }

  return (
    <footer
      className="fixed bottom-0 z-30 flex flex-row items-center justify-end gap-1 border-t border-border-divider bg-card px-2 py-4 shadow-card transition-all duration-300"
      style={{
        left: isMobile ? "0" : isCollapsed ? "64px" : "256px",
        right: "0",
        width: isMobile
          ? "100%"
          : `calc(100% - ${isCollapsed ? "64px" : "256px"})`,
      }}
    >
      {exibirSuspender ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={handleSuspender}
          className="h-[42px] shrink-0 rounded-lg border-[#fed7aa] bg-[#fff7ed] px-6 text-sm font-semibold text-[#ea580c] hover:bg-[#fff7ed]/90 hover:text-[#ea580c]"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Suspender"
          )}
        </Button>
      ) : null}
      {exibirConcluir ? (
        <Button
          type="button"
          disabled={concluirDisabled}
          onClick={handleConcluirRequisitoPendente}
          className="h-[42px] shrink-0 rounded-lg bg-[#50d283] px-6 text-sm font-semibold text-white hover:bg-[#50d283]/90"
        >
          {pending ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="mr-2 h-3.5 w-3.5" />
          )}
          Concluir Requisito Pendente
        </Button>
      ) : null}
    </footer>
  );
}
