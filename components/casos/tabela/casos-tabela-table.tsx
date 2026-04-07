"use client";

import { useRouter } from "next/navigation";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ImportanciaBadge } from "@/components/importancia-badge";
import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { CasosTabelaSkeletonRows } from "@/components/casos/layout/casos-tabela-skeleton";

export interface CasosTabelaRow {
  id: string;
  numero: string;
  produto: string;
  versao: string;
  descricao: string;
  status: string;
  categoria: string;
  importancia: number;
}

interface CasosTabelaTableProps {
  itens: CasosTabelaRow[];
  isFetchingNextPage: boolean;
}

export function CasosTabelaTable({
  itens,
  isFetchingNextPage,
}: CasosTabelaTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="w-[60px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Registro
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Categoria
          </TableHead>
          <TableHead className="w-[200px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Produto
          </TableHead>
          <TableHead className="flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5">
            Resumo
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Importância
          </TableHead>
          <TableHead className="w-[150px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {itens.map((row) => (
          <TableRow
            key={row.id}
            className="bg-white border-t border-[#e0e0e0] hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => router.push(`/casos/${row.id}`)}
          >
            <TableCell className="w-[60px] py-3 px-5">
              <span className="text-base font-light text-[#1d1d1d] whitespace-nowrap">
                #{row.numero}
              </span>
            </TableCell>

            <TableCell className="w-[100px] py-3 px-5">
              <div className="flex justify-center">
                <CategoriaBadge categoria={row.categoria} />
              </div>
            </TableCell>

            <TableCell className="w-[200px] py-3 px-5">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-light text-[#1d1d1d]">
                  {row.produto}
                </span>
                <span className="text-xs font-light text-[#1d1d1d]">
                  {row.versao}
                </span>
              </div>
            </TableCell>

            <TableCell className="flex-1 py-3 px-5">
              <span className="text-sm font-light text-[#1d1d1d]">
                {row.descricao || "—"}
              </span>
            </TableCell>

            <TableCell className="w-[100px] py-3 px-5">
              <div className="flex justify-center">
                <ImportanciaBadge importancia={row.importancia} />
              </div>
            </TableCell>

            <TableCell className="w-[150px] py-3 px-5">
              <StatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}

        {isFetchingNextPage && <CasosTabelaSkeletonRows count={3} />}
      </TableBody>
    </Table>
  );
}

