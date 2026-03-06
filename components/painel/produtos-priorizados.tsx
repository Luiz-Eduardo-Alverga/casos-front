"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText } from "lucide-react";

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
  onProdutoSelect: (id: string, selected: boolean) => void;
}

export function ProdutosPriorizados({ produtos, onProdutoSelect }: ProdutosPriorizadosProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-5 pb-2 border-b border-border-divider">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">Produtos Priorizados</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <Table>
          <TableHeader>
            <TableRow className="bg-white border-b border-white hover:bg-white">
              <TableHead className="w-[30px] text-center text-transparent font-medium text-sm h-auto py-3 px-2.5">Sel.</TableHead>
              {/* <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">Ordem</TableHead> */}
              <TableHead className="w-[180px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">Produto</TableHead>
              <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">Versão</TableHead>
              <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">Abertos</TableHead>
              <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">Corrigidos</TableHead>
              <TableHead className="w-[80px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">Retornos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.id} className="bg-white border-t border-border-divider hover:bg-white">
                <TableCell className="w-[30px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={produto.selecionado}
                      onCheckedChange={(checked) => onProdutoSelect(produto.id, checked === true)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                </TableCell>
                {/* <TableCell className="w-[80px] text-center py-3 px-2.5">
                  <span className="text-xs font-semibold text-text-primary">{Number(produto.ordem) + 1}</span>
                </TableCell> */}
                <TableCell className="w-[180px] py-3 px-2.5">
                  <span className="text-xs font-semibold text-text-primary">{produto.produto}</span>
                </TableCell>
                <TableCell className="w-[80px] text-center py-3 px-2.5">
                  <span className="text-xs font-semibold text-text-primary">{produto.versao}</span>
                </TableCell>
                <TableCell className="w-[30px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Badge className="bg-blue-100 text-blue-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-blue-100">
                    {produto.abertos}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="w-[80px] text-center py-3 px-2.5">
                  <div className="flex justify-center">
                    <Badge className="bg-green-100 text-green-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-green-100">
                    {produto.corrigidos}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="w-[80px] text-center py-3 px-2.5">
                  <div className="flex justify-center">
                    <Badge className="bg-orange-100 text-orange-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-orange-100">
                    {produto.retornos}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
