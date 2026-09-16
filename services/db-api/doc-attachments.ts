import { fetchWithAuth } from "@/lib/fetch";
import {
  inferMimeFromFile,
  putFileToSignedUploadUrl,
  validateCaseAttachmentFile,
  type PresignUploadResponse,
} from "@/services/db-api/case-attachments";
import { presignUploadBodySchema } from "@/lib/validators/db/case-attachments";

export type DocAttachmentListItem = {
  id: string;
  docId: string;
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

export type DocAttachmentCreated = DocAttachmentListItem;

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

export async function presignDocAttachmentUpload(
  docId: string,
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
    `/api/db/docs/${docId}/anexos/presign-upload`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return parseJsonOk<PresignUploadResponse>(res);
}

export async function finalizeDocAttachment(
  docId: string,
  input: {
    path: string;
    filenameOriginal: string;
    mimeType: string;
    sizeBytes: number;
  },
): Promise<DocAttachmentCreated> {
  const res = await fetchWithAuth(`/api/db/docs/${docId}/anexos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOk<DocAttachmentCreated>(res);
}

export async function listDocAttachmentsClient(
  docId: string,
): Promise<DocAttachmentListItem[]> {
  const res = await fetchWithAuth(`/api/db/docs/${docId}/anexos`);
  return parseJsonOk<DocAttachmentListItem[]>(res);
}

export async function deleteDocAttachmentClient(
  docId: string,
  anexoId: string,
): Promise<void> {
  const res = await fetchWithAuth(`/api/db/docs/${docId}/anexos/${anexoId}`, {
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

export async function uploadDocAttachmentFull(
  docId: string,
  file: File,
): Promise<DocAttachmentCreated> {
  const err = validateCaseAttachmentFile(file);
  if (err) throw new Error(err);

  const mime = inferMimeFromFile(file)!;
  const presign = await presignDocAttachmentUpload(docId, file);
  await putFileToSignedUploadUrl(presign.uploadUrl, presign.token, file);
  return finalizeDocAttachment(docId, {
    path: presign.path,
    filenameOriginal: file.name,
    mimeType: mime,
    sizeBytes: file.size,
  });
}
