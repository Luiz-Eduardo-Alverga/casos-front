"use client";

import { createContext, useContext, ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { ComboboxOption } from "@/components/ui/combobox";
import type { Produto } from "@/services/auxiliar/produtos";

interface CasoFormContextValue {
  // Form methods
  form: UseFormReturn<any>;
  
  // Options
  produtosOptions: ComboboxOption[];
  versoesOptions: ComboboxOption[];
  projetosOptions: ComboboxOption[];
  modulosOptions: ComboboxOption[];
  origensOptions: ComboboxOption[];
  categoriasOptions: ComboboxOption[];
  relatoresOptions: ComboboxOption[];
  devOptions: ComboboxOption[];
  qasOptions: ComboboxOption[];
  importanceOptions: ComboboxOption[];
  
  // Loading states
  isProdutosLoading: boolean;
  isVersoesLoading: boolean;
  isProjetosLoading: boolean;
  isModulosLoading: boolean;
  isOrigensLoading: boolean;
  isCategoriasLoading: boolean;
  isUsuariosLoading: boolean;
  
  // Search handlers
  onProdutosSearchChange: (search: string) => void;
  onVersoesSearchChange: (search: string) => void;
  onProjetosSearchChange: (search: string) => void;
  onModulosSearchChange: (search: string) => void;
  onOrigensSearchChange: (search: string) => void;
  onCategoriasSearchChange: (search: string) => void;
  onUsuariosSearchChange: (search: string) => void;
  
  // State
  produto?: string;
  produtoSelecionado?: Produto | null;
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
