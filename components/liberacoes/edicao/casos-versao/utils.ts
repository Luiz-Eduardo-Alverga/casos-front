import type { LiberacaoCasoItem } from "@/interfaces/liberacao";

export interface CasoVersaoRow {
  id: string;
  resumo: string;
  modulo: string | null;
  versao: string;
  dataAbertura: string | null;
  descricao: string;
  liberacao: boolean;
}

export type CasoVersaoRowState = CasoVersaoRow;

export function mapLiberacaoCasoItemToCasoVersaoRow(
  item: LiberacaoCasoItem,
): CasoVersaoRow {
  return {
    id: String(item.caso_id),
    resumo: item.descricao_resumo ?? "",
    modulo: item.modulo,
    versao: item.versao ?? "",
    dataAbertura: item.datas,
    descricao: item.passos_para_reproduzir ?? "",
    liberacao: Boolean(item.liberacao),
  };
}

export function isCasoVersaoRowDirty(
  row: CasoVersaoRowState,
  saved: { descricao: string; liberacao: boolean } | undefined,
): boolean {
  if (!saved) return true;
  return (
    row.descricao !== saved.descricao || row.liberacao !== saved.liberacao
  );
}
