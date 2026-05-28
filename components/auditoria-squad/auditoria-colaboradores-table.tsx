"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditoriaColaboradoresTableProps } from "./types";
import { AuditoriaColaboradorRow } from "./auditoria-colaborador-row";
import { AuditoriaDetailDialog } from "./auditoria-detail-dialog";
import type { ProductionAnalysisColaborador } from "@/hooks/producao/use-production-analysis";

export function AuditoriaColaboradoresTable({
  colaboradores,
  projetoLabel,
}: AuditoriaColaboradoresTableProps) {
  const [detailColaborador, setDetailColaborador] =
    useState<ProductionAnalysisColaborador | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleOpenDetail = (colaborador: ProductionAnalysisColaborador) => {
    setDetailColaborador(colaborador);
    setDetailOpen(true);
  };

  return (
    <>
      <Card className="bg-card shadow-card rounded-lg flex flex-col">
        <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Membros do Squad
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 border-b border-border-divider hover:bg-muted/40">
                  <TableHead className="py-4 w-[220px] px-6 text-xs font-semibold uppercase tracking-[0.6px] text-text-secondary">
                    Colaborador
                  </TableHead>
                  <TableHead className="py-4 px-6 w-[220px] text-xs font-semibold uppercase tracking-[0.6px] text-text-secondary">
                    Produção
                  </TableHead>
                  <TableHead className="py-4 px-6 w-[280px] text-xs font-semibold uppercase tracking-[0.6px] text-text-secondary">
                    Distribuição
                  </TableHead>
                  <TableHead className="py-4 px-6 w-[200px] text-xs font-semibold uppercase tracking-[0.6px] text-text-secondary">
                    Status
                  </TableHead>
                  <TableHead className="py-4 px-6 w-[80px] text-xs font-semibold uppercase tracking-[0.6px] text-text-secondary">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colaborador, index) => (
                  <AuditoriaColaboradorRow
                    key={`${colaborador.nome_suporte}-${colaborador.data_producao}-${index}`}
                    colaborador={colaborador}
                    projetoLabel={projetoLabel}
                    onOpenDetail={handleOpenDetail}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AuditoriaDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        colaborador={detailColaborador}
      />
    </>
  );
}
