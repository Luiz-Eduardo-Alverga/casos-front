"use client";

import { createContext, useContext, ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { ComboboxOption } from "@/components/ui/combobox";

interface CasoFormContextValue {
  // Form methods
  form: UseFormReturn<any>;
  
  // Options estáticas (mock)
  importanceOptions: ComboboxOption[];
  
  // State para dependências entre campos
  produto?: string;
  isDisabled: boolean;
}

const CasoFormContext = createContext<CasoFormContextValue | undefined>(undefined);

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
