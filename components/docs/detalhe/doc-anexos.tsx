"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { AnexosList } from "@/components/casos/edicao/anexos/anexos-list";
import {
  useDeleteDocAttachment,
  useDocAttachments,
  useUploadDocAttachmentsBatch,
} from "@/hooks/docs/use-doc-attachments";
import { DocAnexosSkeleton } from "./doc-anexos-skeleton";
import { DocAnexosUpload } from "./doc-anexos-upload";

export interface DocAnexosProps {
  docId: string;
  canEdit: boolean;
  enabled: boolean;
}

export function DocAnexos({ docId, canEdit, enabled }: DocAnexosProps) {
  const { data: items = [], isLoading, isError, error } = useDocAttachments({
    docId,
    enabled,
  });
  const uploadBatch = useUploadDocAttachmentsBatch();
  const deleteAttachment = useDeleteDocAttachment();
  const [stagingFiles, setStagingFiles] = useState<File[]>([]);

  const handleEnviar = async () => {
    if (stagingFiles.length === 0) {
      toast.error("Selecione pelo menos um arquivo.");
      return;
    }
    try {
      await uploadBatch.mutateAsync({
        docId,
        files: stagingFiles,
      });
      toast.success(`${stagingFiles.length} anexo(s) enviado(s) com sucesso.`);
      setStagingFiles([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar anexos.");
    }
  };

  if (isLoading) {
    return <DocAnexosSkeleton showUpload={canEdit} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Não foi possível carregar os anexos."}
        </p>
      ) : null}

      {canEdit ? (
        <div className="space-y-2">
          <DocAnexosUpload
            files={stagingFiles}
            onFilesChange={setStagingFiles}
            disabled={uploadBatch.isPending}
            pasteEnabled={enabled}
          />
          <Button
            type="button"
            onClick={() => void handleEnviar()}
            disabled={stagingFiles.length === 0 || uploadBatch.isPending}
          >
            {uploadBatch.isPending ? "Enviando…" : "Enviar anexos"}
          </Button>
        </div>
      ) : null}

      <AnexosList
        items={items}
        canDelete={canEdit}
        isDeleting={deleteAttachment.isPending}
        emptyMessage="Nenhum anexo neste documento ainda."
        onDelete={async (id) => {
          await deleteAttachment.mutateAsync({ id, docId });
          toast.success("Anexo removido.");
        }}
      />
    </div>
  );
}
