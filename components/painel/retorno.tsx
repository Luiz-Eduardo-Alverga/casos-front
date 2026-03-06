"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import { RetornoSkeleton } from "@/components/painel/retorno-skeleton";
import { getUser } from "@/lib/auth";
import { useProjetoMemoria } from "@/hooks/use-projeto-memoria";
import type { ProjetoMemoriaItem } from "@/services/projeto-memoria/get-projeto-memoria";

function mapItemToRow(item: ProjetoMemoriaItem) {
  const prioridade = item.caso.caracteristicas.prioridade;
  return {
    id: String(item.caso.id),
    importancia: Number(prioridade) || 0,
    produto: item.produto.nome ?? "",
    versao: item.produto.versao ?? "",
    numero: String(item.caso.id),
    descricao: item.caso.textos.descricao_resumo ?? "",
  };
}

export function Retorno() {
  const user = getUser();
  const usuarioDevId = user?.id != null ? String(user.id) : "";

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(
      {
        per_page: 15,
        usuario_dev_id: usuarioDevId,
        status_id: "4",
      },
      { enabled: Boolean(usuarioDevId) },
    );

  const itens = data?.pages.flatMap((p) => p.data.map(mapItemToRow)) ?? [];

  if (isLoading) {
    return <RetornoSkeleton />;
  }

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Retorno
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        {itens.length === 0 ? (
          <EmptyState
            imageSrc="/images/empty-state-retorno.svg"
            imageAlt="Nenhum retorno encontrado"
            icon={RefreshCcw}
            title="Nenhum retorno encontrado"
            description="Não há itens em retorno no momento."
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
                  <TableHead className="flex-1 font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                    Descrição
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((retorno) => (
                  <TableRow
                    key={retorno.id}
                    className="bg-white border-t border-border-divider hover:bg-white"
                  >
                    <TableCell className="w-[30px] py-3 px-2.5">
                      <div className="flex justify-center">
                        <Badge className="bg-yellow-100 text-yellow-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-yellow-100">
                          {retorno.importancia}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="w-[140px] py-3 px-2.5">
                      <span className="text-xs font-semibold text-text-primary">
                        {retorno.produto}
                      </span>
                    </TableCell>
                    <TableCell className="w-[80px] py-3 px-2.5">
                      <span className="text-xs font-semibold text-text-primary">
                        {retorno.versao}
                      </span>
                    </TableCell>
                    <TableCell className="w-[80px] py-3 px-2.5">
                      <span className="text-xs font-semibold text-text-primary">
                        {retorno.numero}
                      </span>
                    </TableCell>
                    <TableCell className="flex-1 py-3 px-2.5">
                      <span className="text-xs font-semibold text-text-primary whitespace-nowrap">
                        {retorno.descricao}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {hasNextPage && (
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
  );
}
