import { fetchWithAuth } from "@/lib/fetch";
import {
  assertExtensionMatchesMime,
  presignUploadBodySchema,
} from "@/lib/validators/db/case-attachments";

export type PresignUploadResponse = {
  bucket: string;
  path: string;
  uploadUrl: string;
  token: string;
};

export type CaseAttachmentListItem = {
  id: string;
  casoRegistro: number;
  bucket: string;
  path: string;
  filenameOriginal: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  createdBy: string | null;
  createdAt: string | null;
  downloadUrl: string;
};

export type CaseAttachmentCreated = CaseAttachmentListItem;

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
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  if (name.endsWith(".mov")) return "video/quicktime";
  return null;
}

/** Valida arquivo antes do presign (mensagem em pt-BR). */
export function validateCaseAttachmentFile(file: File): string | null {
  const mime = inferMimeFromFile(file);
  if (!mime) {
    return "Não foi possível identificar o tipo do arquivo. Use PNG, JPG, WEBP, GIF, PDF, MP4, WEBM ou MOV.";
  }
  const candidate = presignUploadBodySchema.safeParse({
    filename: file.name,
    mimeType: mime,
    sizeBytes: file.size,
  });
  if (!candidate.success) {
    return candidate.error.issues[0]?.message ?? "Arquivo inválido";
  }
  if (!assertExtensionMatchesMime(file.name, mime)) {
    return "Extensão do arquivo não corresponde ao tipo.";
  }
  return null;
}

export async function presignCaseAttachmentUpload(
  casoRegistro: number,
  file: File,
): Promise<PresignUploadResponse> {
  const mime = inferMimeFromFile(file);
  if (!mime) {
    throw new Error("Tipo de arquivo não suportado");
  }
  const body = presignUploadBodySchema.parse({
    filename: file.name,
    mimeType: mime,
    sizeBytes: file.size,
  });

  const res = await fetchWithAuth(
    `/api/db/casos/${casoRegistro}/anexos/presign-upload`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return parseJsonOk<PresignUploadResponse>(res);
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

export async function finalizeCaseAttachment(
  casoRegistro: number,
  input: {
    path: string;
    filenameOriginal: string;
    mimeType: string;
    sizeBytes: number;
  },
): Promise<CaseAttachmentCreated> {
  const res = await fetchWithAuth(`/api/db/casos/${casoRegistro}/anexos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOk<CaseAttachmentCreated>(res);
}

export async function listCaseAttachmentsClient(
  casoRegistro: number,
): Promise<CaseAttachmentListItem[]> {
  const res = await fetchWithAuth(`/api/db/casos/${casoRegistro}/anexos`);
  return parseJsonOk<CaseAttachmentListItem[]>(res);
}

export async function deleteCaseAttachmentClient(id: string): Promise<void> {
  const res = await fetchWithAuth(`/api/db/anexos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const json = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Erro ${res.status}`,
    );
  }
}

export async function uploadCaseAttachmentFull(
  casoRegistro: number,
  file: File,
): Promise<CaseAttachmentCreated> {
  const err = validateCaseAttachmentFile(file);
  if (err) throw new Error(err);

  const mime = inferMimeFromFile(file)!;
  const presign = await presignCaseAttachmentUpload(casoRegistro, file);
  await putFileToSignedUploadUrl(
    presign.uploadUrl,
    presign.token,
    file,
  );
  return finalizeCaseAttachment(casoRegistro, {
    path: presign.path,
    filenameOriginal: file.name,
    mimeType: mime,
    sizeBytes: file.size,
  });
}
