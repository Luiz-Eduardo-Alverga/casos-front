"use client";

import type React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ComboboxField } from "@/components/reports-form/combobox-field";

interface CasosFiltrosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  usuarioOptions: Array<{ value: string; label: string }>;
  methods: UseFormReturn<any>;
  onFiltrar: () => void;
  onLimpar: () => void;
}

export const CasosFiltrosSheet = ({
  open,
  onOpenChange,
  trigger,
  usuarioOptions,
  methods,
  onFiltrar,
  onLimpar,
}: CasosFiltrosSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-md lg:max-w-lg w-[92vw]"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="p-6 pb-3 border-b">
            <SheetTitle>Mais filtros</SheetTitle>
            <SheetDescription>
              Refine sua busca usando filtros adicionais.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto p-6 pt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ComboboxField
                name="usuario_dev_id"
                label="Desenvolvedor"
                icon={User}
                options={usuarioOptions}
                placeholder="Selecione um desenvolvedor..."
                emptyText="Nenhum usuário encontrado."
                searchDebounceMs={450}
                required={false}
              />

              <ComboboxField
                name="usuario_qa_id"
                label="QA"
                icon={User}
                options={usuarioOptions}
                placeholder="Selecione um QA..."
                emptyText="Nenhum usuário encontrado."
                searchDebounceMs={450}
                required={false}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  Produção (início)
                </Label>
                <Controller
                  name="data_producao_inicio"
                  control={methods.control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value as Date | undefined}
                      onChange={field.onChange}
                      placeholder="Selecionar data"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  Produção (fim)
                </Label>
                <Controller
                  name="data_producao_fim"
                  control={methods.control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value as Date | undefined}
                      onChange={field.onChange}
                      placeholder="Selecionar data"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="flex flex-row p-6 pt-4 border-t gap-2">
            <Button
              type="button"
              onClick={() => {
                onFiltrar();
                onOpenChange(false);
              }}
              className="w-full"
            >
              <Search className="h-3.5 w-3.5 mr-2" />
              <span>Filtrar</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onLimpar}
              className="w-full"
            >
              Limpar filtros
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
