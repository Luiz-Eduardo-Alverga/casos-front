export const PLACEHOLDER_DESCRICAO_COMPLETA =
  "Descreva detalhadamente o caso, incluindo contexto, passos para reproduzir e comportamento esperado...";

/** Exibe data no formato \"Criado em ...\" */
export function formatarCriadoEm(dataAnotacao: string) {
  if (!dataAnotacao?.trim()) return "";
  const s = dataAnotacao.trim();
  if (/^criado em/i.test(s)) return s;
  return `Criado em ${s}`;
}

