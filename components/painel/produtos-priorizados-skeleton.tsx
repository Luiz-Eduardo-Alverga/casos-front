"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

const ROWS = 5;

export function ProdutosPriorizadosSkeleton() {
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
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white border-b border-white hover:bg-white">
              <TableHead className="w-[30px] text-center font-medium text-sm h-auto py-3 px-2.5">
                Sel.
              </TableHead>
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
          <TableBody>
            {Array.from({ length: ROWS }).map((_, i) => (
              <TableRow
                key={i}
                className="bg-white border-t border-border-divider hover:bg-white"
              >
                <TableCell className="w-[30px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                </TableCell>
                <TableCell className="w-[180px] py-3 px-2.5">
                  <Skeleton className="h-4 w-[140px]" />
                </TableCell>
                <TableCell className="w-[80px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-12" />
                  </div>
                </TableCell>
                <TableCell className="w-[80px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Skeleton className="h-7 w-9 rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="w-[80px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Skeleton className="h-7 w-9 rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="w-[80px] py-3 px-2.5">
                  <div className="flex justify-center">
                    <Skeleton className="h-7 w-9 rounded-full" />
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
