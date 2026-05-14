import type { ClienteCasoItem } from "@/interfaces/projeto-memoria";

export interface AbaClientesProps {
  clientes: ClienteCasoItem[];
}

export type ClientesFormValues = {
  clienteId: string;
  clienteSelecionado?: string;
};

