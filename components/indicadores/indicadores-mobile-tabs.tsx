"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/painel/empty-state";
import { cn } from "@/lib/utils";
import { IndicadoresItem } from "./indicadores-item";
import type { IndicadoresMobileTabsProps } from "./types";
import type { ColaboradorIndicador } from "@/services/rh/get-colaboradores-indicadores";

export function IndicadoresMobileTabs({
  alcancou,
  resta,
  recalculatingId,
  onDetalhe,
  onRecalcular,
}: IndicadoresMobileTabsProps) {
  return (
    <Card className="overflow-hidden rounded-lg bg-card shadow-card lg:hidden">
      <Tabs defaultValue="alcancou" className="w-full">
        <CardHeader className="border-b border-border-divider p-0">
          <TabsList className="h-auto w-full justify-start gap-2 rounded-none bg-transparent p-0 px-4 pt-2">
            <TabsTrigger
              value="alcancou"
              className={cn(
                "h-10 rounded-none border-b-2 border-transparent px-2 text-sm shadow-none",
                "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
              )}
            >
              Alcançou
              <span className="ml-2 inline-flex h-5 items-center rounded-full bg-status-success/10 px-2 text-xs font-semibold text-status-success">
                {alcancou.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="resta"
              className={cn(
                "h-10 rounded-none border-b-2 border-transparent px-2 text-sm shadow-none",
                "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
              )}
            >
              Resta
              <span className="ml-2 inline-flex h-5 items-center rounded-full bg-destructive/10 px-2 text-xs font-semibold text-destructive">
                {resta.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="p-0">
          <TabsContent value="alcancou" className="mt-0">
            <ListaMobile
              items={alcancou}
              recalculatingId={recalculatingId}
              onDetalhe={onDetalhe}
              onRecalcular={onRecalcular}
            />
          </TabsContent>
          <TabsContent value="resta" className="mt-0">
            <ListaMobile
              items={resta}
              recalculatingId={recalculatingId}
              onDetalhe={onDetalhe}
              onRecalcular={onRecalcular}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

function ListaMobile({
  items,
  recalculatingId,
  onDetalhe,
  onRecalcular,
}: {
  items: ColaboradorIndicador[];
  recalculatingId: number | null;
  onDetalhe: IndicadoresMobileTabsProps["onDetalhe"];
  onRecalcular: IndicadoresMobileTabsProps["onRecalcular"];
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Nenhum indicador no período"
        description="Ajuste as datas ou selecione outro colaborador."
      />
    );
  }

  return (
    <>
      {items.map((item) => (
        <IndicadoresItem
          key={item.id}
          item={item}
          showHoverRecalc={false}
          isRecalculating={recalculatingId === item.id}
          onDetalhe={onDetalhe}
          onRecalcular={onRecalcular}
        />
      ))}
    </>
  );
}
