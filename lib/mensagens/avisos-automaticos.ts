import type { Mensagem } from "@/services/mensagens/get-mensagens";
import { sortMensagensPorDataEnvioCrescente } from "./sort-por-data-envio";

/** Decisão #25 de docs/avisos: só bloqueiam automáticos enviados nos últimos 7 dias. */
export const DIAS_AVISO_AUTOMATICO = 7;

/**
 * A API filtra por `data_msg`, que pode ser anterior ao envio (ex.: msg 30/10, enviado 09/11).
 * Por isso a consulta pede uma janela larga e o corte de 7 dias é feito em `datas.enviado`.
 */
const DIAS_CONSULTA_API = 30;

function toYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function intervaloConsultaAvisosAutomaticos(agora = new Date()) {
  const inicio = new Date(agora);
  inicio.setDate(inicio.getDate() - DIAS_CONSULTA_API);
  const fim = new Date(agora);
  fim.setDate(fim.getDate() + 1);
  return { data_msg_inicio: toYYYYMMDD(inicio), data_msg_fim: toYYYYMMDD(fim) };
}

/** Não lidos, `auto`, com `datas.enviado` nos últimos 7 dias; do mais antigo para o mais novo. */
export function filtrarAvisosAutomaticos(
  mensagens: Mensagem[],
  agora: Date,
): Mensagem[] {
  const limite = agora.getTime() - DIAS_AVISO_AUTOMATICO * 24 * 60 * 60 * 1000;
  return sortMensagensPorDataEnvioCrescente(
    mensagens.filter((m) => {
      if (m.status_leitura?.auto !== true || m.status_leitura?.lido) return false;
      if (!m.datas?.enviado) return false;
      const enviado = new Date(m.datas.enviado).getTime();
      return !Number.isNaN(enviado) && enviado >= limite;
    }),
  );
}
