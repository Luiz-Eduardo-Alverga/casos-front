"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AbaPlaceholderProps {
  titulo: string;
}

export function AbaPlaceholder({ titulo }: AbaPlaceholderProps) {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <CardTitle className="text-sm font-semibold text-text-primary">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <p className="text-sm text-text-secondary">Conteúdo em breve.</p>
      </CardContent>
    </Card>
  );
}
