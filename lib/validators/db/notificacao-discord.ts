import { z } from "zod";

export const patchNotificacaoDiscordSchema = z.object({
  receberNotificacaoDiscord: z.boolean(),
});

export type PatchNotificacaoDiscordInput = z.infer<
  typeof patchNotificacaoDiscordSchema
>;
