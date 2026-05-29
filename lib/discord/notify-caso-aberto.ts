import { buildCasoDiscordMessage } from "@/lib/discord/build-message";
import { fetchNotifyContext } from "@/lib/discord/fetch-notify-context";
import { resolveDiscordRecipient } from "@/lib/discord/resolve-recipient";
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

    if (!context.usuarioDiscord) {
      console.info(
        `[discord] usuario_discord vazio para atribuidoPara=${input.atribuidoPara}; caso #${input.registro} sem DM`,
      );
      return;
    }

    const recipient = await resolveDiscordRecipient(context.usuarioDiscord);
    if (!recipient) {
      console.warn(
        `[discord] Não foi possível resolver Discord "${context.usuarioDiscord}" para caso #${input.registro}`,
      );
      return;
    }

    const content = buildCasoDiscordMessage(input, {
      produtoLabel: context.produtoLabel,
      projetoLabel: context.projetoLabel,
      abertoPor: context.abertoPor,
    });

    await recipient.send(content);
    console.info(
      `[discord] DM enviada para ${recipient.username} (caso #${input.registro})`,
    );
  } catch (error) {
    console.error(
      `[discord] Falha ao notificar caso #${input.registro}:`,
      error,
    );
  }
}
