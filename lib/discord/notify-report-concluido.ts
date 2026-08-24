import { CASO_STATUS_CONCLUIDO_ID } from "@/components/casos/edicao/report-analise-modal/utils";
import {
  findUsuarioIdByNome,
  getUltimaAnotacao,
} from "@/components/casos/edicao/abrir-ocorrencia-utils";
import { fetchAuxiliarUsuarios } from "@/lib/discord/fetch-notify-context";
import { buildReportConcluidoDiscordMessage } from "@/lib/discord/build-report-concluido-message";
import { sendDiscordDmToLegacyUser } from "@/lib/discord/send-dm-to-legacy-user";
import type { AuxiliarUsuarioDiscord } from "@/lib/discord/types";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

type AuthHeaders = { Authorization: string };

export interface ReportConcluidoNotifyInput {
  registro: number;
  relatorId: number | null;
  responsavelFeedbackNome: string | null;
  ultimaAnotacao: string | null;
}

function isReportOrigem(item: ProjetoMemoriaItem): boolean {
  const fromReport = String(item.report?.tipo_abertura ?? "")
    .trim()
    .toUpperCase();
  if (fromReport === "REPORT") return true;
  const fromCaso = String(item.caso?.caracteristicas?.tipo_abertura ?? "")
    .trim()
    .toUpperCase();
  return fromCaso === "REPORT";
}

function parseStatusId(item: ProjetoMemoriaItem): number | null {
  const raw = item.caso?.status?.status_id;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseRelatorId(item: ProjetoMemoriaItem): number | null {
  const fromUsuarios = Number(item.caso?.usuarios?.relator?.id);
  if (Number.isFinite(fromUsuarios) && fromUsuarios > 0) return fromUsuarios;
  const fromRel = Number(item.caso?.relacionamentos?.relator);
  if (Number.isFinite(fromRel) && fromRel > 0) return fromRel;
  return null;
}

export function shouldNotifyReportConcluido(
  item: ProjetoMemoriaItem | null | undefined,
): boolean {
  if (!item) return false;
  if (!isReportOrigem(item)) return false;
  const statusAtual = parseStatusId(item);
  if (statusAtual === CASO_STATUS_CONCLUIDO_ID) return false;
  return true;
}

export function buildReportConcluidoNotifyInput(
  item: ProjetoMemoriaItem,
  registro: number,
): ReportConcluidoNotifyInput {
  const ultima = getUltimaAnotacao(item.caso?.anotacoes);
  return {
    registro,
    relatorId: parseRelatorId(item),
    responsavelFeedbackNome:
      item.report?.responsavel_feedback_nome?.trim() || null,
    ultimaAnotacao: ultima?.anotacoes?.trim() || null,
  };
}

function uniquePositiveIds(ids: Array<number | null>): number[] {
  const seen = new Set<number>();
  const result: number[] = [];
  for (const id of ids) {
    if (id == null || !Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

function usuarioDiscordByLegacyId(
  usuarios: AuxiliarUsuarioDiscord[],
  legacyUserId: number,
): string | null {
  const found = usuarios.find((u) => String(u.id) === String(legacyUserId));
  return found?.usuario_discord?.trim() || null;
}

/**
 * Envia DM ao relator e ao responsável de feedback após concluir um report.
 * Falhas são apenas logadas — não propagam erro à rota HTTP.
 */
export async function notifyDiscordReportConcluido(
  authHeaders: AuthHeaders,
  input: ReportConcluidoNotifyInput,
): Promise<void> {
  if (!process.env.DISCORD_BOT_TOKEN?.trim()) {
    console.warn(
      "[discord] DISCORD_BOT_TOKEN ausente; notificação de conclusão ignorada para caso",
      input.registro,
    );
    return;
  }

  try {
    const usuarios = await fetchAuxiliarUsuarios(authHeaders, false);
    const feedbackId = findUsuarioIdByNome(
      usuarios,
      input.responsavelFeedbackNome,
    );
    const destinatarios = uniquePositiveIds([input.relatorId, feedbackId]);

    if (destinatarios.length === 0) {
      console.info(
        `[discord] sem destinatários para conclusão do caso #${input.registro}`,
      );
      return;
    }

    const content = buildReportConcluidoDiscordMessage(
      input.registro,
      input.ultimaAnotacao,
    );
    const logContext = `caso #${input.registro} concluído`;

    for (const legacyUserId of destinatarios) {
      await sendDiscordDmToLegacyUser({
        legacyUserId,
        usuarioDiscord: usuarioDiscordByLegacyId(usuarios, legacyUserId),
        content,
        logContext,
      });
    }
  } catch (error) {
    console.error(
      `[discord] Falha ao notificar conclusão do caso #${input.registro}:`,
      error,
    );
  }
}
