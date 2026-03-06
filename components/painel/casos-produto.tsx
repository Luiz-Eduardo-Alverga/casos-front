"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box } from "lucide-react";

interface Caso {
  id: string;
  numero: string;
  versao: string;
  descricao: string;
  categoria: string;
  tempoEstimado: string;
  tempoRealizado: string;
  importancia: number;
}

interface CasosProdutoProps {
  casos: Caso[];
  produtoNome: string;
}

export function CasosProduto({ casos, produtoNome }: CasosProdutoProps) {
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-5 pb-2 border-b border-border-divider">
        <div className="flex items-center gap-2">
          <Box className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Casos do {produtoNome}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <div className="flex flex-col gap-4">
        {casos.map((caso) => (
          <div
            key={caso.id}
            className="bg-white border border-border-divider rounded-lg p-3.5 flex flex-col gap-0"
          >
            {/* Top Section */}
            <div className="flex gap-3 items-start pb-2 border-b border-border-divider">
              {/* Importância Badge */}
              <Badge className="bg-yellow-100 text-yellow-700 border-transparent rounded-full w-9 h-7 flex items-center justify-center shrink-0 hover:bg-yellow-100">
                {caso.importancia}
              </Badge>

              {/* Caso Info */}
              <div className="flex-1 flex flex-wrap gap-3.75 items-start">
                <span className="text-xs font-semibold text-black">#{caso.numero}</span>
                <span className="text-[10px] font-semibold text-text-secondary">{caso.versao}</span>
                <p className="text-[10px] font-semibold text-text-secondary leading-5 w-full">
                  {caso.descricao}
                </p>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between pt-2.5">
              {/* Categoria Badge */}
              <Badge variant="secondary" className="rounded-full px-4 py-1">
                {caso.categoria}
              </Badge>

              {/* Tempo */}
              <span className="text-xs font-semibold text-text-secondary">
                E: {caso.tempoEstimado} / R: {caso.tempoRealizado}
              </span>
            </div>
          </div>
        ))}
        </div>
      </CardContent>
    </Card>
  );
}
