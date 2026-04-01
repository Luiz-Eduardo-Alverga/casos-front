"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PainelContagemStatusBadge } from "@/components/painel/painel-contagem-status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";

interface ProdutoPriorizado {
  id: string;
  ordem: string;
  produto: string;
  versao: string;
  abertos: number;
  corrigidos: number;
  retornos: number;
  selecionado: boolean;
}

interface ProdutosPriorizadosProps {
  produtos: ProdutoPriorizado[];
  onProdutoSelect: (ordem: string, selected: boolean) => void;
}

export function ProdutosPriorizados({
  produtos,
  onProdutoSelect,
}: ProdutosPriorizadosProps) {
  const [selectedOrdem, setSelectedOrdem] = useState<string | null>(null);

  // Sincronizar com o pai (ex.: restauração do localStorage); limpar se não houver seleção ou produto sair da lista
  useEffect(() => {
    const selecionado = produtos.find((p) => p.selecionado);
    if (selecionado) {
      setSelectedOrdem(selecionado.ordem);
    } else {
      setSelectedOrdem(null);
    }
  }, [produtos]);

  const handleCheckedChange = (ordem: string, checked: boolean) => {
    setSelectedOrdem(checked ? ordem : null);
    onProdutoSelect(ordem, checked);
  };

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Produtos Priorizados
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        {produtos.length === 0 ? (
          <EmptyState
            imageSrc="/images/empty-state-produtos-priorizados.svg"
            imageAlt="Nenhum produto priorizado"
            icon={FileText}
            title="Nenhum produto priorizado"
            description="Selecione ou adicione produtos"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-white border-b border-white hover:bg-white">
                <TableHead className="w-[30px] text-center text-transparent font-medium text-sm h-auto py-3 px-2.5">
                  Sel.
                </TableHead>
                {/* <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">Ordem</TableHead> */}
                <TableHead className="w-[180px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Produto
                </TableHead>
                <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Versão
                </TableHead>
                <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Abertos
                </TableHead>
                <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Corrigidos
                </TableHead>
                <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
                  Retornos
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {produtos.map((produto) => (
                <TableRow
                  key={produto.ordem}
                  className="bg-white border-t border-border-divider hover:bg-white"
                >
                  <TableCell className="w-[30px] py-3 px-2.5">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={selectedOrdem === produto.ordem}
                        onCheckedChange={(checked) =>
                          handleCheckedChange(produto.ordem, checked === true)
                        }
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="w-[180px] py-3 px-2.5">
                    <span className="text-xs font-semibold text-text-primary">
                      {produto.produto}
                    </span>
                  </TableCell>
                  <TableCell className="w-[80px] text-center py-3 px-2.5">
                    <span className="text-xs font-semibold text-text-primary">
                      {produto.versao}
                    </span>
                  </TableCell>
                  <TableCell className="w-[30px] py-3 px-2.5">
                    <div className="flex justify-center">
                      <PainelContagemStatusBadge variant="abertos">
                        {produto.abertos}
                      </PainelContagemStatusBadge>
                    </div>
                  </TableCell>
                  <TableCell className="w-[80px] text-center py-3 px-2.5">
                    <div className="flex justify-center">
                      <PainelContagemStatusBadge variant="corrigidos">
                        {produto.corrigidos}
                      </PainelContagemStatusBadge>
                    </div>
                  </TableCell>
                  <TableCell className="w-[80px] text-center py-3 px-2.5">
                    <div className="flex justify-center">
                      <PainelContagemStatusBadge variant="retornos">
                        {produto.retornos}
                      </PainelContagemStatusBadge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
