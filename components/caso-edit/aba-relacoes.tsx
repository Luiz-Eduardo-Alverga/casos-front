"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import { EmptyState } from "@/components/painel/empty-state";
import { GitBranch } from "lucide-react";

export interface AbaRelacoesProps {
  casoId: number;
}

export function AbaRelacoes({ casoId }: AbaRelacoesProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col h-full">
      <CasoEditCardHeader title="Relações" icon={GitBranch} badge={casoId} />
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <EmptyState
          imageAlt="Nenhuma relação"
          imageSrc="/images/empty-state-casos-produto.svg"
          title="Nenhuma relação"
          description="Os dados de relações não estão disponíveis no momento."
        />
      </CardContent>
    </Card>
  );
}
