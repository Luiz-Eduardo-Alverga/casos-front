import { buildCasoDiscordMessage } from "@/lib/discord/build-message";
import { fetchNotifyContext } from "@/lib/discord/fetch-notify-context";
import { sendDiscordDmToLegacyUser } from "@/lib/discord/send-dm-to-legacy-user";
import type { CasoDiscordNotifyInput } from "@/lib/discord/types";

type AuthHeaders = { Authorization: string };

/**
 * Envia DM ao dev atribuído após abertura/clonagem de caso.
 * Falhas são apenas logadas — não propagam erro à rota HTTP.
 * Invocado via scheduleDiscordCasoNotify (after) para não bloquear a UI.
 */
export async function notifyDiscordCasoAberto(
  authHeaders: AuthHeaders,
  input: CasoDiscordNotifyInput,
): Promise<void> {
  if (!process.env.DISCORD_BOT_TOKEN?.trim()) {
    console.warn(
      "[discord] DISCORD_BOT_TOKEN ausente; notificação ignorada para caso",
      input.registro,
    );
    return;
  }

  try {
    const context = await fetchNotifyContext(authHeaders, input);
    const content = buildCasoDiscordMessage(input, {
      produtoLabel: context.produtoLabel,
      projetoLabel: context.projetoLabel,
      abertoPor: context.abertoPor,
    });

    await sendDiscordDmToLegacyUser({
      legacyUserId: input.atribuidoPara,
      usuarioDiscord: context.usuarioDiscord,
      content,
      logContext: `caso #${input.registro}`,
    });
  } catch (error) {
    console.error(
      `[discord] Falha ao notificar caso #${input.registro}:`,
      error,
    );
  }
}
