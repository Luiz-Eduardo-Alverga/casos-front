import type { ClienteCasoItem } from "@/interfaces/projeto-memoria";

export interface VincularClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registro: number | null;
  onConcluido: () => void;
}

export type VincularClienteFormValues = {
  clienteId: string;
  clienteSelecionado?: string;
};

export interface VincularClienteFormProps {
  registro: number;
  isAdding: boolean;
  clienteId: string;
  clienteSelecionado?: string;
  onAdd: (payload: {
    registro: number;
    cliente: number;
    incidente: number;
  }) => Promise<void>;
}

export interface VincularClienteListProps {
  clientes: ClienteCasoItem[];
  urlPorCliente: Map<number, string>;
  isLoadingUrls?: boolean;
  onAskDelete: (sequencia: number) => void;
}
