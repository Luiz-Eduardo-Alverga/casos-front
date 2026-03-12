"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import { GitBranch } from "lucide-react";

export function AbaRelacoes() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col h-full">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Relações
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
        <EmptyState
          imageAlt="Nenhuma relação"
          icon={GitBranch}
          title="Nenhuma relação"
          description="Os dados de relações não estão disponíveis no momento."
        />
      </CardContent>
    </Card>
  );
}
