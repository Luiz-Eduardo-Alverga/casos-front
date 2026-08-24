import { getAppUserByLegacyUserId } from "@/lib/db/app-users";
import { resolveDiscordRecipient } from "@/lib/discord/resolve-recipient";

/**
 * Envia DM ao usuário Soft Flow (`legacy_user_id`).
 * Respeita opt-out em `app_users`; se o usuário não existir na tabela, envia.
 */
export async function sendDiscordDmToLegacyUser(params: {
  legacyUserId: number;
  usuarioDiscord: string | null;
  content: string;
  logContext: string;
}): Promise<void> {
  const { legacyUserId, usuarioDiscord, content, logContext } = params;

  const appUser = await getAppUserByLegacyUserId(legacyUserId);
  if (appUser && !appUser.receberNotificacaoDiscord) {
    console.info(
      `[discord] usuário legacy=${legacyUserId} optou por não receber DM; ${logContext}`,
    );
    return;
  }

  const username = usuarioDiscord?.trim() || null;
  if (!username) {
    console.info(
      `[discord] usuario_discord vazio para legacy=${legacyUserId}; ${logContext} sem DM`,
    );
    return;
  }

  const recipient = await resolveDiscordRecipient(username);
  if (!recipient) {
    console.warn(
      `[discord] Não foi possível resolver Discord "${username}" para ${logContext}`,
    );
    return;
  }

  await recipient.send(content);
  console.info(
    `[discord] DM enviada para ${recipient.username} (${logContext})`,
  );
}
