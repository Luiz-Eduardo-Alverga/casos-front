"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { RefreshCcw } from "lucide-react";

interface Retorno {
  id: string;
  importancia: number;
  produto: string;
  versao: string;
  numero: string;
  descricao: string;
}

interface RetornoProps {
  retornos: Retorno[];
}

export function Retorno({ retornos }: RetornoProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-5 pb-2 border-b border-border-divider">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">Retorno</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <Table>
          <TableHeader>
            <TableRow className="bg-white border-b border-white hover:bg-white">
              <TableHead className="w-[30px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">Imp.</TableHead>
              <TableHead className="w-[140px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">Produto</TableHead>
              <TableHead className="w-[80px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">Versão</TableHead>
              <TableHead className="w-[80px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">Número</TableHead>
              <TableHead className="flex-1 font-medium text-sm text-text-primary h-auto py-3 px-2.5">Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retornos.map((retorno) => (
              <TableRow key={retorno.id} className="bg-white border-t border-border-divider hover:bg-white">
                <TableCell className="w-[30px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Badge className="bg-yellow-100 text-yellow-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center hover:bg-yellow-100">
                      {retorno.importancia}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="w-[140px] py-3 px-2.5">
                  <span className="text-xs font-semibold text-text-primary">{retorno.produto}</span>
                </TableCell>
                <TableCell className="w-[80px] py-3 px-2.5">
                  <span className="text-xs font-semibold text-text-primary">{retorno.versao}</span>
                </TableCell>
                <TableCell className="w-[80px] py-3 px-2.5">
                  <span className="text-xs font-semibold text-text-primary">{retorno.numero}</span>
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
      </CardContent>
    </Card>
  );
}
