"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  parseAgendaDevCount,
  type AgendaDevItem,
} from "@/services/auxiliar/get-agenda-dev";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import { EmptyState } from "@/components/painel/empty-state";
import { FileText } from "lucide-react";

interface PainelKanbanAgendaCardsFieldProps {
  agendaItems: AgendaDevItem[];
}

interface AgendaCardItem {
  key: string;
  ordem: string;
  produtoId: string;
  produtoNome: string;
  versao: string;
  abertos: number;
  retornos: number;
}

export function PainelKanbanAgendaCardsField({
  agendaItems,
}: PainelKanbanAgendaCardsFieldProps) {
  const { watch, setValue } = useFormContext<PainelKanbanFiltrosForm>();
  const produto = watch("produto");
  const versao = watch("versao");

  const cards = useMemo<AgendaCardItem[]>(() => {
    const unique = new Map<string, AgendaCardItem>();
    for (const item of agendaItems) {
      const produtoId = String(item.id_produto ?? "").trim();
      const versaoItem = String(item.versao ?? "").trim();
      if (!produtoId || !versaoItem) continue;

      const key = `${produtoId}::${versaoItem}`;
      if (unique.has(key)) continue;

      unique.set(key, {
        key,
        ordem: String(item.ordem ?? "").trim(),
        produtoId,
        produtoNome: item.produto?.trim() || `Produto ${produtoId}`,
        versao: versaoItem,
        abertos: parseAgendaDevCount(item.abertos),
        retornos: parseAgendaDevCount(item.retornos),
      });
    }

    return Array.from(unique.values()).sort((a, b) => {
      const na = Number.parseInt(a.ordem, 10);
      const nb = Number.parseInt(b.ordem, 10);
      const aNum = Number.isFinite(na) ? na : Number.POSITIVE_INFINITY;
      const bNum = Number.isFinite(nb) ? nb : Number.POSITIVE_INFINITY;
      return aNum - bNum;
    });
  }, [agendaItems]);

  const handleSelect = (card: AgendaCardItem) => {
    setValue("produto", card.produtoId);
    setValue("versao", card.versao);
  };

  if (cards.length === 0) {
    return (
      // <div className="rounded-lg border border-border-divider bg-white p-4 text-sm text-text-secondary">
      //   Nenhum produto priorizado encontrado para o colaborador selecionado.
      // </div>
      <EmptyState
        title="Nenhum produto priorizado encontrado"
        description="Selecione um outro colaborador e projeto para ver os produtos priorizados."
        icon={FileText}
      />
    );
  }

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
    >
      <CarouselContent className="-ml-3">
        {cards.map((card) => {
          const isSelected =
            produto === card.produtoId && versao === card.versao;

          return (
            <CarouselItem
              key={card.key}
              className="pl-3 basis-[190px] sm:basis-[210px]"
            >
              <button
                type="button"
                onClick={() => handleSelect(card)}
                className={cn(
                  "relative w-full rounded-lg border bg-white p-3 text-left transition-colors",
                  "hover:border-brand-yellow",
                  isSelected ? "border-brand-yellow " : "border-border-divider",
                )}
                aria-pressed={isSelected}
              >
                <span
                  className={cn(
                    "absolute right-3 top-3 inline-flex h-4 w-4 items-center justify-center rounded-full border",
                    isSelected
                      ? "border-brand-yellow bg-brand-yellow "
                      : "border-border-divider bg-white",
                  )}
                >
                  {isSelected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white " />
                  ) : null}
                </span>

                <p className="truncate pr-6 text-xs font-bold text-text-primary">
                  {card.produtoNome}
                </p>
                <p className="mt-1 text-xs text-text-secondary ">
                  {card.versao}
                </p>

                <div className="mt-1.5 flex items-center gap-4 text-xs text-text-primary">
                  <span className="inline-flex items-center gap-1">
                    Abertos
                    <Badge className="h-5 min-w-5 rounded-full border-transparent bg-blue-100 px-1.5 text-[10px] text-blue-700 hover:bg-blue-100">
                      {card.abertos}
                    </Badge>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    Retornos
                    <Badge className="h-5 min-w-5 rounded-full border-transparent bg-orange-100 px-1.5 text-[10px] text-orange-700 hover:bg-orange-100">
                      {card.retornos}
                    </Badge>
                  </span>
                </div>
              </button>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden" />
      <CarouselNext className="hidden" />
    </Carousel>
  );
}
