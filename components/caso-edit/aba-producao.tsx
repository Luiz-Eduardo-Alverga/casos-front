"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import { Package } from "lucide-react";

export interface AbaProducaoProps {
  casoId: number;
}

export function AbaProducao({ casoId }: AbaProducaoProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col">
      <CasoEditCardHeader title="Produção" icon={Package} badge={casoId} />
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0">
        <p className="text-sm text-text-secondary">Em breve.</p>
      </CardContent>
    </Card>
  );
}
