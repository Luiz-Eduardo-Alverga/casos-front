"use client";

import { useMemo, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CasoFormProvider,
  CasoFormProduto,
  CasoFormVersao,
  CasoFormProjeto,
  CasoFormRelator,
  CasoFormDevAtribuido,
  CasoFormQaAtribuido,
  CasoFormImportancia,
  CasoFormStatus,
} from "@/components/caso-form";
import { importanceOptions } from "@/mocks/teste";
import { useProjetoMemoria } from "@/hooks/use-projeto-memoria";
import type { ProjetoMemoriaItem } from "@/services/projeto-memoria/get-projeto-memoria";
import { getUser } from "@/lib/auth";
import { Filter, Search, Loader2, ArrowLeft, Box } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";

interface CasosFiltersForm {
  produto: string;
  versao: string;
  projeto: string;
  relator: string;
  devAtribuido: string;
  qaAtribuido: string;
  status: string;
  importancia: string;
  descricao_resumo: string;
}

const defaultFilters: CasosFiltersForm = {
  produto: "",
  versao: "",
  projeto: "",
  relator: "",
  devAtribuido: "",
  qaAtribuido: "",
  status: "",
  importancia: "",
  descricao_resumo: "",
};

function formatMinutesToHHMM(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "00:00";
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function mapItemToRow(item: ProjetoMemoriaItem) {
  const prioridade = item.caso.caracteristicas.prioridade;
  return {
    id: String(item.caso.id),
    importancia: Number(prioridade) || 0,
    produto: item.produto.nome ?? "",
    versao: item.produto.versao ?? "",
    numero: String(item.caso.id),
    descricao: item.caso.textos.descricao_resumo ?? "",
    status: item.caso.status?.descricao ?? "",
    modulo: item.caso.caracteristicas.modulo ?? "",
    tempoEstimado: formatMinutesToHHMM(item.caso.tempos.estimado_minutos),
    tempoRealizado: formatMinutesToHHMM(item.caso.tempos.realizado_minutos),
  };
}

export default function CasosPage() {
  const router = useRouter();
  const user = getUser();
  const usuarioDevId = user?.id != null ? String(user.id) : "";

  const methods = useForm<CasosFiltersForm>({
    defaultValues: defaultFilters,
  });

  const produto = methods.watch("produto");
  const versao = methods.watch("versao");
  const projeto = methods.watch("projeto");
  const relator = methods.watch("relator");
  const devAtribuido = methods.watch("devAtribuido");
  const qaAtribuido = methods.watch("qaAtribuido");
  const status = methods.watch("status");
  const importancia = methods.watch("importancia");
  const descricao_resumo = methods.watch("descricao_resumo");

  const versaoProduto = useMemo(() => {
    if (!versao) return undefined;
    const part = versao.split("-")[1]?.trim();
    return part || versao;
  }, [versao]);

  const projetoMemoriaParams = useMemo(
    () => ({
      per_page: 15,
      // Quando não há filtro de dev, usa o usuário logado; senão usa o dev selecionado
      usuario_dev_id: devAtribuido || usuarioDevId || undefined,
      ...(produto ? { produto_id: produto } : {}),
      ...(versaoProduto ? { versao_produto: versaoProduto } : {}),
      ...(projeto ? { projeto_id: projeto } : {}),
      ...(relator ? { usuario_abertura_id: relator } : {}),
      ...(qaAtribuido ? { usuario_qa_id: qaAtribuido } : {}),
      ...(status ? { status_id: status } : {}),
      ...(importancia ? { prioridade: importancia } : {}),
      ...(descricao_resumo?.trim()
        ? { descricao_resumo: descricao_resumo.trim() }
        : {}),
    }),
    [
      usuarioDevId,
      produto,
      versaoProduto,
      projeto,
      relator,
      devAtribuido,
      qaAtribuido,
      status,
      importancia,
      descricao_resumo,
    ]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProjetoMemoria(projetoMemoriaParams);

  const itens = useMemo(
    () => data?.pages.flatMap((p) => p.data.map(mapItemToRow)) ?? [],
    [data]
  );

  const handleLimparFiltros = useCallback(() => {
    methods.reset(defaultFilters);
  }, [methods]);

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto,
      isDisabled: false,
    }),
    [methods, produto]
  );

  return (
    <div className="px-6 pt-20 py-10 flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden">
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
            className="w-full sm:w-auto h-[42px] px-4 flex-1 sm:flex-initial"
            onClick={() => router.push("/painel")}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Painel
          </Button>
        </div>
      </div>

      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          {/* Filtros */}
          <Card className="bg-card shadow-card rounded-lg shrink-0 mb-6">
            <CardHeader className="p-5 pb-2 border-b border-border-divider">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-text-primary" />
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Filtros
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CasoFormStatus />
                <CasoFormProduto />
                <CasoFormVersao />
                <CasoFormProjeto />
                <CasoFormRelator />
                <CasoFormDevAtribuido />
                <CasoFormQaAtribuido />
                <CasoFormImportancia />
                <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                  <Label className="text-sm font-medium text-text-label">
                    Descrição / Resumo
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por descrição ou resumo..."
                      className="pl-9 h-[42px] rounded-lg border-border-input"
                      {...methods.register("descricao_resumo")}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLimparFiltros}
                >
                  Limpar filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Casos */}
          <Card className="bg-card shadow-card rounded-lg flex flex-col lg:flex-1 lg:min-h-0 flex-1">
            <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
              <div className="flex items-center gap-2">
                <Box className="h-3.5 w-3.5 text-text-primary" />
                <CardTitle className="text-sm font-semibold text-text-primary">
                  Listagem de Casos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : itens.length === 0 ? (
                <EmptyState
                  imageSrc="/images/empty-state-casos-produto.svg"
                  imageAlt="Nenhum caso encontrado"
                  icon={Box}
                  title="Nenhum caso encontrado"
                  description="Ajuste os filtros ou não há casos que correspondam aos critérios."
                  className="w-42 h-42"
                />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white border-b border-white hover:bg-white">
                        <TableHead className="w-[30px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Imp.
                        </TableHead>
                        <TableHead className="w-[140px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Produto
                        </TableHead>
                        <TableHead className="w-[80px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Versão
                        </TableHead>
                        <TableHead className="w-[80px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Número
                        </TableHead>
                        <TableHead className="w-[120px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Status
                        </TableHead>
                        <TableHead className="flex-1 font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Descrição
                        </TableHead>
                        <TableHead className="w-[100px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                          Tempo
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itens.map((row) => (
                        <TableRow
                          key={row.id}
                          className="bg-white border-t border-border-divider hover:bg-white"
                        >
                          <TableCell className="w-[30px] py-3 px-2.5">
                            <div className="flex justify-center">
                              <Badge className="bg-yellow-100 text-yellow-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-yellow-100">
                                {row.importancia}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="w-[140px] py-3 px-2.5">
                            <span className="text-xs font-semibold text-text-primary">
                              {row.produto}
                            </span>
                          </TableCell>
                          <TableCell className="w-[80px] py-3 px-2.5">
                            <span className="text-xs font-semibold text-text-primary">
                              {row.versao}
                            </span>
                          </TableCell>
                          <TableCell className="w-[80px] py-3 px-2.5">
                            <span className="text-xs font-semibold text-text-primary">
                              #{row.numero}
                            </span>
                          </TableCell>
                          <TableCell className="w-[120px] py-3 px-2.5">
                            <span className="text-xs font-semibold text-text-primary">
                              {row.status || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="flex-1 py-3 px-2.5">
                            <span className="text-xs font-semibold text-text-primary line-clamp-2">
                              {row.descricao || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="w-[100px] py-3 px-2.5">
                            <span className="text-xs font-semibold text-text-secondary">
                              E: {row.tempoEstimado} / R: {row.tempoRealizado}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {hasNextPage && itens.length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            Carregando...
                          </>
                        ) : (
                          "Carregar mais"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </FormProvider>
      </CasoFormProvider>
    </div>
  );
}
