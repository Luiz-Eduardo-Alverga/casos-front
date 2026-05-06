import {
  CASE_ATTACHMENTS_BUCKET,
  SIGNED_DOWNLOAD_TTL_SEC,
} from "@/lib/constants/case-attachments";
import { getSupabaseServiceRoleClient } from "@/lib/storage/supabase";

export type SignedUploadResult = {
  path: string;
  uploadUrl: string;
  token: string;
};

/**
 * Gera URL assinada para o cliente fazer `PUT` do arquivo direto no Storage.
 */
export async function createCaseAttachmentSignedUpload(
  objectPath: string,
): Promise<SignedUploadResult> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(CASE_ATTACHMENTS_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(
      error?.message ?? "Falha ao gerar URL de upload do anexo",
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

export async function createCaseAttachmentSignedDownloadUrl(
  objectPath: string,
  expiresInSec = SIGNED_DOWNLOAD_TTL_SEC,
): Promise<string> {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(CASE_ATTACHMENTS_BUCKET)
    .createSignedUrl(objectPath, expiresInSec);

  if (error || !data?.signedUrl) {
    throw new Error(
      error?.message ?? "Falha ao gerar URL de download do anexo",
    );
  }
  return data.signedUrl;
}

/**
 * Lê metadados do objeto após upload (tamanho / mimetype) via listagem na pasta pai.
 */
export async function getCaseAttachmentObjectInfo(objectPath: string): Promise<{
  size: number;
  mimeType: string | null;
} | null> {
  const supabase = getSupabaseServiceRoleClient();
  const segments = objectPath.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const fileName = segments.pop()!;
  const folder = segments.join("/");

  const { data, error } = await supabase.storage
    .from(CASE_ATTACHMENTS_BUCKET)
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

export async function removeCaseAttachmentObject(
  objectPath: string,
): Promise<void> {
  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase.storage
    .from(CASE_ATTACHMENTS_BUCKET)
    .remove([objectPath]);

  if (error) {
    throw new Error(error.message ?? "Falha ao remover arquivo do storage");
  }
}
