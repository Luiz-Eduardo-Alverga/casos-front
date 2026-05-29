import {
  Client,
  Events,
  GatewayIntentBits,
  type Client as DiscordClient,
} from "discord.js";

const globalForDiscord = globalThis as typeof globalThis & {
  discordClient?: DiscordClient;
  discordReady?: Promise<void>;
};

function createDiscordClient(): DiscordClient {
  return new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });
}

/**
 * Cliente Discord reutilizado entre invocações da Route Handler (warm instances).
 * Login síncrono na primeira utilização da requisição.
 */
export async function getDiscordClient(): Promise<DiscordClient> {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN não configurado");
  }

  if (!globalForDiscord.discordClient) {
    globalForDiscord.discordClient = createDiscordClient();
    globalForDiscord.discordReady = new Promise<void>((resolve, reject) => {
      const client = globalForDiscord.discordClient!;
      client.once(Events.ClientReady, () => resolve());
      client.once("error", reject);
      client.login(token).catch(reject);
    });
  }

  await globalForDiscord.discordReady;
  return globalForDiscord.discordClient!;
}
