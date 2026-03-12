"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export function AbaProducao() {
  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Produção
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 lg:flex-1 lg:min-h-0">
        <p className="text-sm text-text-secondary">Em breve.</p>
      </CardContent>
    </Card>
  );
}
