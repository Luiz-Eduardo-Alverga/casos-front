"use client";

import { useState, useEffect } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  ListFilter,
  RotateCcw,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  DEFAULT_FILTROS_RESUMO,
  FILTROS_RESUMO_CATALOGO,
  type CasoFiltroField,
  type FiltroResumoItem,
} from "@/components/casos/filtros/casos-filtros.types";
import { useUpsertUserFiltrosPreferencias } from "@/hooks/configuracoes/use-user-filtros-preferencias";

type FiltroDraftItem = FiltroResumoItem & { visible: boolean };

function buildDraftFromSalvos(salvos: FiltroResumoItem[]): FiltroDraftItem[] {
  const salvosByField = new Map(salvos.map((s) => [s.field, s]));
  const salvosOrder = salvos.map((s) => s.field);
  const hiddenFields = FILTROS_RESUMO_CATALOGO.map((c) => c.field).filter(
    (field) => !salvosByField.has(field),
  );
  const orderedFields = [...salvosOrder, ...hiddenFields];

  return orderedFields.map((field) => {
    const saved = salvosByField.get(field);
    const catalog = FILTROS_RESUMO_CATALOGO.find((c) => c.field === field)!;
    return {
      field,
      colSpan: saved?.colSpan ?? catalog.defaultColSpan,
      visible: Boolean(saved),
    };
  });
}

function draftToSalvos(draft: FiltroDraftItem[]): FiltroResumoItem[] {
  return draft
    .filter((item) => item.visible)
    .map(({ field, colSpan }) => ({ field, colSpan }));
}

const TIPO_ICONS = {
  Texto: Search,
  Seleção: ListFilter,
  Múltiplo: Layers,
} as const;

interface SortableFiltroRowProps {
  item: FiltroDraftItem;
  index: number;
  total: number;
  label: string;
  tipo: "Texto" | "Seleção" | "Múltiplo";
  onColSpanToggle: (field: CasoFiltroField) => void;
  onVisibilityToggle: (field: CasoFiltroField) => void;
  onMove: (index: number, direction: "up" | "down") => void;
}

function SortableFiltroRow({
  item,
  index,
  total,
  label,
  tipo,
  onColSpanToggle,
  onVisibilityToggle,
  onMove,
}: SortableFiltroRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.field });

  const TipoIcon = TIPO_ICONS[tipo];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-border-divider bg-card px-4 py-2",
        isDragging && "opacity-60",
        !item.visible && "opacity-50",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className={cn(
            "shrink-0 text-text-secondary hover:text-text-primary",
            item.visible
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-not-allowed opacity-60",
          )}
          aria-label={`Mover ${label} na ordenação`}
          disabled={!item.visible}
          {...(item.visible ? { ...attributes, ...listeners } : {})}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <span
          className={cn(
            "inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded bg-blue-100 px-2 text-xs font-bold text-blue-700",
            !item.visible && "bg-muted text-muted-foreground",
          )}
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-semibold",
              item.visible ? "text-text-primary" : "text-muted-foreground",
            )}
          >
            {label}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <TipoIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{tipo}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Tabs
          value={String(item.colSpan)}
          onValueChange={(value) => {
            if (!item.visible) return;
            const next = value === "2" ? 2 : 1;
            if (next !== item.colSpan) {
              onColSpanToggle(item.field);
            }
          }}
        >
          <TabsList
            className={cn("h-7 p-0.5", !item.visible && "pointer-events-none")}
          >
            <TabsTrigger
              value="1"
              disabled={!item.visible}
              className="h-6 px-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              title="1 coluna"
            >
              1c
            </TabsTrigger>
            <TabsTrigger
              value="2"
              disabled={!item.visible}
              className="h-6 px-2.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              title="2 colunas"
            >
              2c
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
            disabled={!item.visible || index === 0}
            onClick={() => onMove(index, "up")}
            aria-label={`Mover ${label} para cima`}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
            disabled={!item.visible || index === total - 1}
            onClick={() => onMove(index, "down")}
            aria-label={`Mover ${label} para baixo`}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className={cn(
            "h-8 w-8 shrink-0 rounded-md",
            item.visible
              ? "border-primary/30 text-primary hover:bg-primary/5"
              : "border-border text-muted-foreground",
          )}
          onClick={() => onVisibilityToggle(item.field)}
          aria-label={item.visible ? `Ocultar ${label}` : `Exibir ${label}`}
          title={item.visible ? "Ocultar filtro" : "Exibir filtro"}
        >
          {item.visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface CasosFiltrosPersonalizarProps {
  filtrosAtuais: FiltroResumoItem[];
  onPreviewChange?: (preview: FiltroResumoItem[] | null) => void;
}

export function CasosFiltrosPersonalizar({
  filtrosAtuais,
  onPreviewChange,
}: CasosFiltrosPersonalizarProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FiltroDraftItem[]>(() =>
    buildDraftFromSalvos(filtrosAtuais),
  );
  const { mutate, isPending } = useUpsertUserFiltrosPreferencias();

  const catalogMap = Object.fromEntries(
    FILTROS_RESUMO_CATALOGO.map((c) => [c.field, c]),
  ) as Record<CasoFiltroField, (typeof FILTROS_RESUMO_CATALOGO)[number]>;

  useEffect(() => {
    if (open) {
      setDraft(buildDraftFromSalvos(filtrosAtuais));
    }
  }, [open, filtrosAtuais]);

  useEffect(() => {
    if (open) {
      onPreviewChange?.(draftToSalvos(draft));
    }
  }, [open, draft, onPreviewChange]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const initial = buildDraftFromSalvos(filtrosAtuais);
      setDraft(initial);
      onPreviewChange?.(draftToSalvos(initial));
    } else {
      onPreviewChange?.(null);
    }
    setOpen(nextOpen);
  }

  const visibleCount = draft.filter((item) => item.visible).length;
  const isValid = visibleCount >= 1;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = draft.findIndex((d) => d.field === active.id);
    const newIndex = draft.findIndex((d) => d.field === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setDraft((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  function handleColSpanToggle(field: CasoFiltroField) {
    setDraft((prev) =>
      prev.map((d) => {
        if (d.field !== field || !d.visible) return d;
        const next: 1 | 2 = d.colSpan === 1 ? 2 : 1;
        return { ...d, colSpan: next };
      }),
    );
  }

  function handleVisibilityToggle(field: CasoFiltroField) {
    setDraft((prev) =>
      prev.map((d) => (d.field === field ? { ...d, visible: !d.visible } : d)),
    );
  }

  function handleMove(index: number, direction: "up" | "down") {
    setDraft((prev) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      return arrayMove(prev, index, newIndex);
    });
  }

  function handleSalvar() {
    if (!isValid) return;
    mutate(draftToSalvos(draft), { onSuccess: () => handleOpenChange(false) });
  }

  function handleRedefinir() {
    setDraft(buildDraftFromSalvos(DEFAULT_FILTROS_RESUMO));
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          type="button"
          title="Personalizar filtros"
        >
          <Settings className="h-3.5 w-3.5 text-text-primary" />
          <span>Personalizar</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-full flex-col w-full sm:max-w-[588px] p-0 gap-0 border-border-divider [&>button]:hidden"
      >
        <SheetHeader className="shrink-0 border-b border-border-divider space-y-2 px-4 pb-4 pt-5 sm:px-6">
          <SheetTitle className="text-xl font-semibold text-text-primary leading-tight">
            Filtros da listagem
          </SheetTitle>
          <SheetDescription className="text-sm text-text-secondary">
            Mostre, ordene e dimensione cada filtro. As mudanças aparecem na
            tela em tempo real.
          </SheetDescription>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
            <span>
              {visibleCount}/{FILTROS_RESUMO_CATALOGO.length} visíveis
            </span>
            <span className="inline-flex items-center gap-1">
              Arraste pelo
              <GripVertical className="h-3.5 w-3.5" />
              para reordenar
            </span>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={draft.map((d) => d.field)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {draft.map((item, index) => {
                  const catalog = catalogMap[item.field];
                  return (
                    <SortableFiltroRow
                      key={item.field}
                      item={item}
                      index={index}
                      total={draft.length}
                      label={catalog.label}
                      tipo={catalog.tipo}
                      onColSpanToggle={handleColSpanToggle}
                      onVisibilityToggle={handleVisibilityToggle}
                      onMove={handleMove}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          {!isValid && (
            <p className="mt-3 text-xs text-destructive">
              Mantenha ao menos um filtro visível para salvar.
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-border-divider px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRedefinir}
            className="h-10"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="h-10 flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSalvar}
              disabled={!isValid || isPending}
              className="h-10 flex-1 sm:flex-initial"
            >
              <Check className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
