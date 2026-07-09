import { fetchWithAuth } from "@/lib/fetch";
import type { AppUserSummary } from "@/lib/auth";
import {
  assertAvatarExtensionMatchesMime,
  presignAvatarBodySchema,
} from "@/lib/validators/db/user-avatar";

export type PresignAvatarResponse = {
  bucket: string;
  path: string;
  uploadUrl: string;
  token: string;
};

export type UserAvatarResponse = {
  avatarUrl: string | null;
  avatarPath?: string | null;
  avatarUpdatedAt?: string | null;
};

export type FinalizeAvatarResponse = {
  appUser: AppUserSummary;
  avatarUrl: string;
};

async function parseJsonOk<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as {
    data?: unknown;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Erro ${res.status}`,
    );
  }
  return json.data as T;
}

function inferMimeFromFile(file: File): string | null {
  if (file.type && file.type.trim()) return file.type.trim();
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  return null;
}

export function validateUserAvatarFile(file: File): string | null {
  const mime = inferMimeFromFile(file);
  if (!mime) {
    return "Use uma imagem PNG, JPG ou WEBP.";
  }
  const candidate = presignAvatarBodySchema.safeParse({
    filename: file.name,
    mimeType: mime,
    sizeBytes: file.size,
  });
  if (!candidate.success) {
    return candidate.error.issues[0]?.message ?? "Arquivo inválido";
  }
  if (!assertAvatarExtensionMatchesMime(file.name, mime)) {
    return "Extensão do arquivo não corresponde ao tipo.";
  }
  return null;
}

export async function fetchUserAvatarUrl(): Promise<UserAvatarResponse> {
  const res = await fetchWithAuth("/api/db/app-users/me/avatar");
  return parseJsonOk<UserAvatarResponse>(res);
}

export async function presignUserAvatarUpload(
  file: File,
): Promise<PresignAvatarResponse> {
  const mime = inferMimeFromFile(file);
  if (!mime) throw new Error("Tipo de arquivo não suportado");

  const body = presignAvatarBodySchema.parse({
    filename: file.name,
    mimeType: mime,
    sizeBytes: file.size,
  });

  const res = await fetchWithAuth(
    "/api/db/app-users/me/avatar/presign-upload",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return parseJsonOk<PresignAvatarResponse>(res);
}

export async function putFileToSignedUploadUrl(
  uploadUrl: string,
  token: string,
  file: File,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": file.type || "application/octet-stream",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers,
  });
  if (!putRes.ok) {
    const text = await putRes.text().catch(() => "");
    throw new Error(
      text?.trim()
        ? `Falha ao enviar arquivo (${putRes.status}): ${text.slice(0, 200)}`
        : `Falha ao enviar arquivo (${putRes.status})`,
    );
  }
}

export async function finalizeUserAvatar(input: {
  path: string;
  filenameOriginal: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<FinalizeAvatarResponse> {
  const res = await fetchWithAuth("/api/db/app-users/me/avatar", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOk<FinalizeAvatarResponse>(res);
}

export async function deleteUserAvatar(): Promise<{
  appUser: AppUserSummary;
  avatarUrl: null;
}> {
  const res = await fetchWithAuth("/api/db/app-users/me/avatar", {
    method: "DELETE",
  });
  return parseJsonOk<{ appUser: AppUserSummary; avatarUrl: null }>(res);
}

export async function uploadUserAvatarFull(
  file: File,
): Promise<FinalizeAvatarResponse> {
  const err = validateUserAvatarFile(file);
  if (err) throw new Error(err);

  const mime = inferMimeFromFile(file)!;
  const presign = await presignUserAvatarUpload(file);
  await putFileToSignedUploadUrl(presign.uploadUrl, presign.token, file);
  return finalizeUserAvatar({
    path: presign.path,
    filenameOriginal: file.name,
    mimeType: mime,
    sizeBytes: file.size,
  });
}
