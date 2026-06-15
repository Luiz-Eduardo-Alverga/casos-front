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
import { GripVertical, Save, Settings, SlidersHorizontal, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

const TOTAL_SLOTS = 4;

// ---------------------------------------------------------------------------
// SortableFiltroRow
// ---------------------------------------------------------------------------

interface SortableFiltroRowProps {
  item: FiltroResumoItem;
  index: number;
  label: string;
  availableSlots: number;
  onColSpanToggle: (field: CasoFiltroField) => void;
  onRemove: (field: CasoFiltroField) => void;
}

function SortableFiltroRow({
  item,
  index,
  label,
  availableSlots,
  onColSpanToggle,
  onRemove,
}: SortableFiltroRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.field });

  const canExpandToTwo = item.colSpan === 2 || availableSlots >= 1;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center justify-between rounded-lg border border-border-divider bg-card px-4 py-3",
        isDragging && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="shrink-0 cursor-grab text-text-secondary hover:text-text-primary active:cursor-grabbing"
          aria-label={`Mover ${label} na ordenação`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-blue-100 px-2 text-xs font-bold text-blue-700">
          {index + 1}
        </span>

        <span className="truncate text-sm font-medium text-text-primary">
          {label}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 ml-3">
        <Tabs
          value={String(item.colSpan)}
          onValueChange={(value) => {
            const next = value === "2" ? 2 : 1;
            if (next !== item.colSpan) {
              if (next === 2 && !canExpandToTwo) return;
              onColSpanToggle(item.field);
            }
          }}
        >
          <TabsList className="h-7 p-0.5">
            <TabsTrigger
              value="1"
              className="h-6 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              title="1 coluna"
            >
              1 col
            </TabsTrigger>
            <TabsTrigger
              value="2"
              disabled={item.colSpan === 1 && !canExpandToTwo}
              className="h-6 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              title="2 colunas"
            >
              2 col
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-text-secondary hover:text-destructive"
          onClick={() => onRemove(item.field)}
          aria-label={`Remover ${label}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CasosFiltrosPersonalizar
// ---------------------------------------------------------------------------

interface CasosFiltrosPersonalizarProps {
  filtrosAtuais: FiltroResumoItem[];
}

export function CasosFiltrosPersonalizar({
  filtrosAtuais,
}: CasosFiltrosPersonalizarProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FiltroResumoItem[]>(filtrosAtuais);
  const { mutate, isPending } = useUpsertUserFiltrosPreferencias();

  useEffect(() => {
    if (open) {
      setDraft(filtrosAtuais);
    }
  }, [open, filtrosAtuais]);

  const usedSlots = draft.reduce((acc, i) => acc + i.colSpan, 0);
  const isValid = usedSlots === TOTAL_SLOTS;
  const availableSlots = TOTAL_SLOTS - usedSlots;

  const activeFields = new Set(draft.map((d) => d.field));

  const inactiveCatalog = FILTROS_RESUMO_CATALOGO.filter(
    (c) => !activeFields.has(c.field),
  );

  const labelMap = Object.fromEntries(
    FILTROS_RESUMO_CATALOGO.map((c) => [c.field, c.label]),
  ) as Record<CasoFiltroField, string>;

  // DnD
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
        if (d.field !== field) return d;
        const next: 1 | 2 = d.colSpan === 1 ? 2 : 1;
        return { ...d, colSpan: next };
      }),
    );
  }

  function handleRemove(field: CasoFiltroField) {
    setDraft((prev) => prev.filter((d) => d.field !== field));
  }

  function handleAdd(field: CasoFiltroField, defaultColSpan: 1 | 2) {
    const span: 1 | 2 =
      defaultColSpan === 2 && availableSlots >= 2 ? 2 : 1;
    setDraft((prev) => [...prev, { field, colSpan: span }]);
  }

  function handleSalvar() {
    if (!isValid) return;
    mutate(draft, { onSuccess: () => setOpen(false) });
  }

  function handleRedefinir() {
    setDraft(DEFAULT_FILTROS_RESUMO);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          type="button"
          title="Personalizar filtros rápidos"
        >
          <Settings className="h-3.5 w-3.5 text-text-primary" />
          <span>Personalizar</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-full flex-col w-full sm:max-w-[588px] p-0 gap-0 border-border-divider [&>button]:hidden"
      >
        <SheetHeader className="shrink-0 border-b border-border-divider space-y-1.5 px-4 pb-4 pt-5 sm:px-6">
          <SheetTitle className="text-xl font-semibold text-text-primary leading-tight">
            Filtros rápidos
          </SheetTitle>
          <SheetDescription className="text-base text-text-secondary">
            Selecione, ordene e ajuste as colunas dos filtros exibidos
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          {/* Contador de slots */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Slots utilizados:{" "}
              <span
                className={cn(
                  "font-semibold",
                  isValid ? "text-text-primary" : "text-destructive",
                )}
              >
                {usedSlots}/{TOTAL_SLOTS}
              </span>
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-3 w-5 rounded-sm",
                    i < usedSlots ? "bg-primary" : "bg-border",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Filtros ativos — sortable */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ativos ({draft.length})
            </p>

            {draft.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-divider bg-muted/30 p-4 text-sm text-text-secondary">
                Nenhum filtro selecionado.
              </div>
            ) : (
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
                    {draft.map((item, index) => (
                      <SortableFiltroRow
                        key={item.field}
                        item={item}
                        index={index}
                        label={labelMap[item.field]}
                        availableSlots={availableSlots}
                        onColSpanToggle={handleColSpanToggle}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {!isValid && draft.length > 0 && (
              <p className="text-xs text-destructive">
                {usedSlots < TOTAL_SLOTS
                  ? `Faltam ${TOTAL_SLOTS - usedSlots} slot(s). Adicione mais filtros ou expanda algum para 2 colunas.`
                  : `Excedeu ${usedSlots - TOTAL_SLOTS} slot(s). Remova filtros ou reduza para 1 coluna.`}
              </p>
            )}
          </div>

          {/* Separador */}
          {inactiveCatalog.length > 0 && (
            <div className="border-t border-border-divider" />
          )}

          {/* Filtros disponíveis — checkboxes */}
          {inactiveCatalog.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Disponíveis
              </p>
              <div className="flex flex-col gap-1">
                {inactiveCatalog.map(({ field, label, defaultColSpan }) => (
                  <div
                    key={field}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                      availableSlots < 1
                        ? "opacity-50"
                        : "hover:bg-muted/30 cursor-pointer",
                    )}
                    onClick={() =>
                      availableSlots >= 1 && handleAdd(field, defaultColSpan)
                    }
                  >
                    <Checkbox
                      id={`filtro-add-${field}`}
                      checked={false}
                      disabled={availableSlots < 1}
                      onCheckedChange={() => handleAdd(field, defaultColSpan)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Label
                      htmlFor={`filtro-add-${field}`}
                      className={cn(
                        "text-sm font-normal",
                        availableSlots >= 1
                          ? "cursor-pointer"
                          : "cursor-not-allowed",
                      )}
                    >
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border-divider px-4 py-4 sm:px-6 flex flex-col items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRedefinir}
            className="w-full h-[42px]"
          >
            Redefinir padrão
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSalvar}
            disabled={!isValid || isPending}
            className="w-full h-[42px]"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
