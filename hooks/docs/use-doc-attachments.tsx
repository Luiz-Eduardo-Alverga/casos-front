"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDocAttachmentClient,
  listDocAttachmentsClient,
  uploadDocAttachmentFull,
  type DocAttachmentListItem,
} from "@/services/db-api/doc-attachments";

export const docAttachmentsQueryKey = (docId: string) =>
  ["doc-attachments", docId] as const;

export function useDocAttachments(params: {
  docId: string | null;
  enabled?: boolean;
}) {
  const docId = params.docId;
  const enabled = (params.enabled ?? true) && Boolean(docId);

  return useQuery({
    queryKey: docId ? docAttachmentsQueryKey(docId) : ["doc-attachments", "none"],
    enabled,
    queryFn: async (): Promise<DocAttachmentListItem[]> => {
      if (!docId) return [];
      return listDocAttachmentsClient(docId);
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUploadDocAttachmentsBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { docId: string; files: File[] }) => {
      return Promise.all(
        input.files.map((file) => uploadDocAttachmentFull(input.docId, file)),
      );
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: docAttachmentsQueryKey(variables.docId),
      });
    },
  });
}

export function useDeleteDocAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; docId: string }) => {
      await deleteDocAttachmentClient(input.docId, input.id);
      return input.docId;
    },
    onSuccess: (docId) => {
      void qc.invalidateQueries({
        queryKey: docAttachmentsQueryKey(docId),
      });
    },
  });
}
