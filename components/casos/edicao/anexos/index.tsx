"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { CasoFormAnexos } from "@/components/casos/cadastro/anexos";
import { AnexosList } from "./anexos-list";
import { useCasoEdit } from "../caso-edit-context";
import {
  useCaseAttachments,
  useDeleteCaseAttachment,
  useUploadCaseAttachmentsBatch,
} from "@/hooks/casos/use-case-attachments";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export interface AbaAnexosProps {
  casoRegistro: number;
}

export function AbaAnexos({ casoRegistro }: AbaAnexosProps) {
  const { numeroCaso } = useCasoEdit();
  const rbacReady = permissionsLoaded();
  const canList = !rbacReady || hasPermission("list-case-attachment");
  const canCreate = !rbacReady || hasPermission("create-case-attachment");
  const canDelete = !rbacReady || hasPermission("delete-case-attachment");

  const { data: items = [], isLoading, isError, error } = useCaseAttachments({
    casoRegistro,
    enabled: canList && Number.isFinite(casoRegistro),
  });

  const uploadBatch = useUploadCaseAttachmentsBatch();
  const deleteAttachment = useDeleteCaseAttachment();

  const [stagingFiles, setStagingFiles] = useState<File[]>([]);

  if (!canList) {
    return null;
  }

  const handleEnviar = async () => {
    if (stagingFiles.length === 0) {
      toast.error("Selecione pelo menos um arquivo.");
      return;
    }
    try {
      await uploadBatch.mutateAsync({
        casoRegistro,
        files: stagingFiles,
      });
      toast.success(
        `${stagingFiles.length} anexo(s) enviado(s) com sucesso.`,
      );
      setStagingFiles([]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao enviar anexos.",
      );
    }
  };

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col h-full lg:min-h-0 lg:flex-1">
      <CasoEditCardHeader
        title="Anexos do caso"
        icon={Paperclip}
        badge={numeroCaso}
      />

      <CardContent className="p-6 pt-3 flex flex-col gap-6 lg:flex-1">
        {isError && (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Não foi possível carregar os anexos."}
          </p>
        )}

        {canCreate && (
          <div className="space-y-3">
            <CasoFormAnexos
              embedded
              files={stagingFiles}
              onFilesChange={setStagingFiles}
              disabled={uploadBatch.isPending}
            />
            <Button
              type="button"
              onClick={() => void handleEnviar()}
              disabled={
                stagingFiles.length === 0 || uploadBatch.isPending
              }
            >
              {uploadBatch.isPending ? "Enviando…" : "Enviar anexos"}
            </Button>
          </div>
        )}

        <div>
          <AnexosList
            items={items}
            isLoading={isLoading}
            canDelete={canDelete}
            isDeleting={deleteAttachment.isPending}
            onDelete={async (id) => {
              await deleteAttachment.mutateAsync({ id, casoRegistro });
              toast.success("Anexo removido.");
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
