import type { ClienteCasoItem } from "@/interfaces/projeto-memoria";

export interface AbaClientesProps {
  casoId: number;
  clientes: ClienteCasoItem[];
  onAdd: (payload: {
    registro: number;
    cliente: number;
    incidente: number;
  }) => Promise<void>;
  onDelete: (sequencia: number) => Promise<void>;
  isAdding?: boolean;
}

export type ClientesFormValues = {
  clienteId: string;
  clienteSelecionado?: string;
};

