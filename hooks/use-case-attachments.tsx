"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCaseAttachmentClient,
  listCaseAttachmentsClient,
  uploadCaseAttachmentFull,
  type CaseAttachmentListItem,
} from "@/services/db-api/case-attachments";

export const caseAttachmentsQueryKey = (casoRegistro: number) =>
  ["case-attachments", casoRegistro] as const;

export function useCaseAttachments(params: {
  casoRegistro: number | null;
  enabled?: boolean;
}) {
  const casoRegistro = params.casoRegistro;
  const enabled =
    (params.enabled ?? true) &&
    casoRegistro != null &&
    Number.isFinite(casoRegistro);

  return useQuery({
    queryKey:
      casoRegistro != null
        ? caseAttachmentsQueryKey(casoRegistro)
        : ["case-attachments", "none"],
    enabled,
    queryFn: async (): Promise<CaseAttachmentListItem[]> => {
      if (casoRegistro == null) return [];
      return listCaseAttachmentsClient(casoRegistro);
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUploadCaseAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { casoRegistro: number; file: File }) => {
      return uploadCaseAttachmentFull(input.casoRegistro, input.file);
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: caseAttachmentsQueryKey(variables.casoRegistro),
      });
    },
  });
}

export function useUploadCaseAttachmentsBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { casoRegistro: number; files: File[] }) => {
      const results = [];
      for (const file of input.files) {
        results.push(await uploadCaseAttachmentFull(input.casoRegistro, file));
      }
      return results;
    },
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({
        queryKey: caseAttachmentsQueryKey(variables.casoRegistro),
      });
    },
  });
}

export function useDeleteCaseAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; casoRegistro: number }) => {
      await deleteCaseAttachmentClient(input.id);
      return input.casoRegistro;
    },
    onSuccess: (casoRegistro) => {
      void qc.invalidateQueries({
        queryKey: caseAttachmentsQueryKey(casoRegistro),
      });
    },
  });
}
