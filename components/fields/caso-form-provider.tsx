"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ComboboxOption } from "@/components/ui/combobox";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

export interface CasoFormContextValue {
  form: UseFormReturn<any>;
  importanceOptions: ComboboxOption[];
  produto?: string;
  isDisabled: boolean;
  lazyLoadComboboxOptions?: boolean;
  editCaseItem?: ProjetoMemoriaItem | null;
}

const CasoFormContext = createContext<CasoFormContextValue | undefined>(
  undefined,
);

export function useCasoForm() {
  const context = useContext(CasoFormContext);
  if (!context) {
    throw new Error("useCasoForm deve ser usado dentro de CasoFormProvider");
  }
  return context;
}

interface CasoFormProviderProps {
  children: ReactNode;
  value: CasoFormContextValue;
}

export function CasoFormProvider({ children, value }: CasoFormProviderProps) {
  return (
    <CasoFormContext.Provider value={value}>
      {children}
    </CasoFormContext.Provider>
  );
}
