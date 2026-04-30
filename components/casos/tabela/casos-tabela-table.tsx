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
import { StatusBadge } from "@/components/badges/status-badge";
import { ImportanciaBadge } from "@/components/badges/importancia-badge";
import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { CasosTabelaSkeletonRows } from "@/components/casos/layout/casos-tabela-skeleton";
import Link from "next/link";
import { ExternalLink, Pencil, SquarePen } from "lucide-react";
import { formatMinutesToHHMM } from "@/lib/utils";

export interface CasosTabelaRow {
  id: string;
  numero: string;
  produto: string;
  versao: string;
  descricao: string;
  status: string;
  categoria: string;
  importancia: number;
  tipo_abertura?: string;
  estimado_minutos: number;
  realizado_minutos: number;
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
        <TableRow className="bg-background border-b border-background hover:bg-background">
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
          <TableHead className="w-[140px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Estimativas
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Importância
          </TableHead>
          <TableHead className="w-[150px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Status
          </TableHead>
          <TableHead className="w-[100px] text-right font-medium text-sm text-text-primary h-auto py-4 ">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {itens.map((row) => (
          <TableRow
            key={row.id}
            className="bg-background border-t border-border-strong hover:bg-muted/50 transition-colors"
          >
            <TableCell className="w-[60px] py-3 px-5">
              <span className="text-base font-light text-cases-ink whitespace-nowrap">
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
                <span className="text-sm font-light text-cases-ink">
                  {row.produto}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-light text-cases-ink">
                    {row.versao}
                  </span>
                  {String(row.tipo_abertura ?? "")
                    .trim()
                    .toUpperCase() === "REPORT" && (
                    <span className=" font-bold  text-xs">REPORT</span>
                  )}
                </div>
              </div>
            </TableCell>

            <TableCell className="flex-1 py-3 px-5">
              <span className="text-sm font-light text-cases-ink">
                {row.descricao || "—"}
              </span>
            </TableCell>

            <TableCell className="w-[140px] py-3 px-5 text-center">
              <span className="text-xs font-semibold text-text-secondary">
                E: {formatMinutesToHHMM(row.estimado_minutos)} / R:{" "}
                {formatMinutesToHHMM(row.realizado_minutos)}
              </span>
            </TableCell>

            <TableCell className="w-[100px] py-3 px-5">
              <div className="flex justify-center">
                <ImportanciaBadge importancia={row.importancia} />
              </div>
            </TableCell>

            <TableCell className="w-[150px] py-3 px-5 ">
              <StatusBadge status={row.status} />
            </TableCell>

            <TableCell className="w-[100px] flex items-center gap-2 justify-end h-16">
              <Link href={`/casos/${row.id}`}>
                <SquarePen className="w-4 h-4 text-emerald-500" />
              </Link>

              <Link target="_blank" href={`/casos/${row.id}`}>
                <ExternalLink className="w-4 h-4 text-blue-500" />
              </Link>
            </TableCell>
          </TableRow>
        ))}

        {isFetchingNextPage && <CasosTabelaSkeletonRows count={3} />}
      </TableBody>
    </Table>
  );
}
