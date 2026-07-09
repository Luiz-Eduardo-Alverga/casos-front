import {
  SIGNED_AVATAR_DOWNLOAD_TTL_SEC,
  USER_AVATAR_BUCKET,
} from "@/lib/constants/user-avatar";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";
import type { SignedUploadResult } from "@/lib/storage/case-attachments";

export type { SignedUploadResult };

export async function createUserAvatarSignedUpload(
  objectPath: string,
): Promise<SignedUploadResult> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(USER_AVATAR_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(
      error?.message ?? "Falha ao gerar URL de upload da foto de perfil",
    );
  }

  const uploadUrl =
    "signedUrl" in data && typeof data.signedUrl === "string"
      ? data.signedUrl
      : (data as { signed_url?: string }).signed_url ?? "";

  if (!uploadUrl) {
    throw new Error("Resposta de upload assinado inválida (sem URL)");
  }

  const token =
    "token" in data && typeof data.token === "string" ? data.token : "";

  return {
    path: data.path,
    uploadUrl,
    token,
  };
}

export async function createUserAvatarSignedDownloadUrl(
  objectPath: string,
  expiresInSec = SIGNED_AVATAR_DOWNLOAD_TTL_SEC,
): Promise<string> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(USER_AVATAR_BUCKET)
    .createSignedUrl(objectPath, expiresInSec);

  if (error || !data?.signedUrl) {
    throw new Error(
      error?.message ?? "Falha ao gerar URL da foto de perfil",
    );
  }
  return data.signedUrl;
}

export async function getUserAvatarObjectInfo(objectPath: string): Promise<{
  size: number;
  mimeType: string | null;
} | null> {
  const supabase = getSupabaseServiceRoleClient();
  const segments = objectPath.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const fileName = segments.pop()!;
  const folder = segments.join("/");

  const { data, error } = await supabase.storage
    .from(USER_AVATAR_BUCKET)
    .list(folder, {
      search: fileName,
      limit: 100,
    });

  if (error || !data?.length) return null;

  const file = data.find((f) => f.name === fileName);
  if (!file) return null;

  const meta = file.metadata as
    | { size?: number; mimetype?: string; contentType?: string }
    | undefined;

  const size =
    typeof meta?.size === "number"
      ? meta.size
      : typeof file.metadata === "object" &&
          file.metadata !== null &&
          "size" in file.metadata &&
          typeof (file.metadata as { size?: unknown }).size === "number"
        ? (file.metadata as { size: number }).size
        : 0;

  const mimeType =
    (meta?.mimetype as string | undefined) ??
    (meta?.contentType as string | undefined) ??
    null;

  return { size, mimeType };
}

export async function removeUserAvatarObject(objectPath: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.storage
    .from(USER_AVATAR_BUCKET)
    .remove([objectPath]);

  if (error) {
    throw new Error(error.message ?? "Falha ao remover foto de perfil do storage");
  }
}
