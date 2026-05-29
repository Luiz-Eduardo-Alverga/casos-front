import { after } from "next/server";
import { notifyDiscordCasoAberto } from "@/lib/discord/notify-caso-aberto";
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
