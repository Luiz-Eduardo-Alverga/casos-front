"use client";

import type React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { FilterX, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";

interface CasosFiltrosSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  methods: UseFormReturn<any>;
  onFiltrar: () => void;
  onLimpar: () => void;
}

export const CasosFiltrosSheet = ({
  open,
  onOpenChange,
  trigger,
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
              <CasoFormDevAtribuido required={false} requireProduto={false} />
              <CasoFormQaAtribuido required={false} requireProduto={false} />
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

          <div className="flex flex-col p-6 pt-4 border-t gap-2">
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
              <FilterX className="h-3.5 w-3.5 mr-2" />
              <span>Limpar filtros</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
