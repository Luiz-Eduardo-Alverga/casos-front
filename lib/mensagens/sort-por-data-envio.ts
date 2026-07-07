import type { Mensagem } from "@/services/mensagens/get-mensagens";

function getTimestampEnvio(mensagem: Mensagem): number {
  const value =
    mensagem.datas?.enviado ??
    mensagem.datas?.msg ??
    mensagem.datas?.hora ??
    null;

  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

/** Ordena avisos do mais recente para o mais antigo com base na data/hora de envio. */
export function sortMensagensPorDataEnvio(mensagens: Mensagem[]): Mensagem[] {
  return [...mensagens].sort(
    (a, b) => getTimestampEnvio(b) - getTimestampEnvio(a),
  );
}
