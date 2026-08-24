import { after } from "next/server";
import { notifyDiscordCasoAberto } from "@/lib/discord/notify-caso-aberto";
import {
  notifyDiscordReportConcluido,
  type ReportConcluidoNotifyInput,
} from "@/lib/discord/notify-report-concluido";
import type { CasoDiscordNotifyInput } from "@/lib/discord/types";

type AuthHeaders = { Authorization: string };

/**
 * Agenda envio da DM após a resposta HTTP — não bloqueia a abertura do caso na UI.
 */
export function scheduleDiscordCasoNotify(
  authHeaders: AuthHeaders,
  input: CasoDiscordNotifyInput,
): void {
  after(async () => {
    await notifyDiscordCasoAberto(authHeaders, input);
  });
}

/**
 * Agenda DM de report concluído após a resposta HTTP — não bloqueia o PATCH.
 */
export function scheduleDiscordReportConcluidoNotify(
  authHeaders: AuthHeaders,
  input: ReportConcluidoNotifyInput,
): void {
  after(async () => {
    await notifyDiscordReportConcluido(authHeaders, input);
  });
}
