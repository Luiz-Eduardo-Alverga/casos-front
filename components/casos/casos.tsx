"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilterX } from "lucide-react";
import { CasosFiltros } from "./filtros/casos-filtros";
import { CasosTabela } from "./casos-tabela";

export function Casos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  /** Referência estável: evita novo objeto `filtros` a cada render quando a query não mudou. */
  const urlQueryKey = searchParams.toString();

  const filtros = useMemo(() => {
    const params = new URLSearchParams(urlQueryKey);
    const produto = params.get("produto") || "";
    const versao = params.get("versao") || "";
    const modulo = params.get("modulo") || "";
    const tipo_categoria = params.get("tipo_categoria") || "";
    const tipo_abertura = params.get("tipo_abertura") || "";
    const descricao_resumo = params.get("descricao_resumo") || "";
    const usuario_abertura_id = params.get("usuario_abertura_id") || "";
    const usuario_dev_id = params.get("usuario_dev_id") || "";
    const usuario_qa_id = params.get("usuario_qa_id") || "";
    const data_producao_inicio = params.get("data_producao_inicio") || "";
    const data_producao_fim = params.get("data_producao_fim") || "";

    let status_ids = params
      .getAll("status_id")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    const legacyStatus = params.get("status")?.trim();
    if (status_ids.length === 0 && legacyStatus) {
      status_ids = [legacyStatus];
    }

    return {
      produto,
      versao,
      modulo,
      tipo_categoria,
      tipo_abertura,
      descricao_resumo,
      status_ids,
      usuario_abertura_id,
      usuario_dev_id,
      usuario_qa_id,
      data_producao_inicio,
      data_producao_fim,
    };
  }, [urlQueryKey]);

  const handleLimparFiltros = useCallback(() => {
    router.push("/casos");
  }, [router]);

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Casos</h1>
          <p className="text-sm text-text-secondary">
            Filtre e visualize os casos do projeto
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={handleLimparFiltros}
          >
            <FilterX className="h-3.5 w-3.5" />
            Limpar filtros
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
            onClick={() => router.push("/painel")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Painel
          </Button>
        </div>
      </div>

      <CasosFiltros filtrosIniciais={filtros} urlQueryKey={urlQueryKey} />
      <CasosTabela filtros={filtros} />
    </div>
  );
}
