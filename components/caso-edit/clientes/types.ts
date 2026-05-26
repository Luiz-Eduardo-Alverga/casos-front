import type { ClienteCasoItem } from "@/interfaces/projeto-memoria";

export interface AbaClientesProps {
  clientes: ClienteCasoItem[];
  isTabActive?: boolean;
}

export type ClientesFormValues = {
  clienteId: string;
  clienteSelecionado?: string;
};

