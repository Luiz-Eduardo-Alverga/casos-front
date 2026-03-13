"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CasosFiltros } from "./casos-filtros";
import { CasosTabela } from "./casos-tabela";

export function Casos() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Ler filtros da URL
  const filtros = useMemo(() => {
    const produto = searchParams.get("produto") || "";
    const versao = searchParams.get("versao") || "";
    const status = searchParams.get("status") || "";
    const modulo = searchParams.get("modulo") || "";
    const tipo_categoria = searchParams.get("tipo_categoria") || "";
    const descricao_resumo = searchParams.get("descricao_resumo") || "";

    return {
      produto,
      versao,
      status,
      modulo,
      tipo_categoria,
      descricao_resumo,
    };
  }, [searchParams]);

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
            onClick={() => router.push("/painel")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Painel
          </Button>
        </div>
      </div>

      <CasosFiltros filtrosIniciais={filtros} />
      <CasosTabela filtros={filtros} />
    </div>
  );
}
