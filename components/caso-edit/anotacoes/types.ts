import type { AnotacaoCasoItem } from "@/interfaces/projeto-memoria";

export interface AbaAnotacoesProps {
  casoId: number;
  report: string;
  anotacoes: AnotacaoCasoItem[];
  onCreate: (payload: { registro: number; anotacoes: string }) => Promise<void>;
  onUpdate: (payload: {
    id: number;
    data: { anotacoes: string };
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isCreating?: boolean;
}

