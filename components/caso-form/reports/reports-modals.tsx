"use client";

import { CasoFormAnexos } from "@/components/caso-form/caso-form-anexos";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { SuccessModal } from "@/components/reports-form/success-modal";

export interface ReportsModalsProps {
  successModalOpen: boolean;
  onSuccessModalClose: () => void;
  numeroCaso: number | null;
  onNovoCasoClick: () => void;
  quickModeConfirmOpen: boolean;
  onQuickModeConfirmOpenChange: (open: boolean) => void;
  onAcceptQuickMode: () => void;
  onRefuseQuickMode: () => void;
  anexosModalOpen: boolean;
  onAnexosModalOpenChange: (open: boolean) => void;
  attachmentFiles: File[];
  onAttachmentFilesChange: (files: File[]) => void;
  anexosDisabled: boolean;
}

export function ReportsModals({
  successModalOpen,
  onSuccessModalClose,
  numeroCaso,
  onNovoCasoClick,
  quickModeConfirmOpen,
  onQuickModeConfirmOpenChange,
  onAcceptQuickMode,
  onRefuseQuickMode,
  anexosModalOpen,
  onAnexosModalOpenChange,
  attachmentFiles,
  onAttachmentFilesChange,
  anexosDisabled,
}: ReportsModalsProps) {
  return (
    <>
      <SuccessModal
        isOpen={successModalOpen}
        onClose={onSuccessModalClose}
        numeroCaso={numeroCaso}
        onNovoCasoClick={onNovoCasoClick}
      />

      <ConfirmacaoModal
        open={quickModeConfirmOpen}
        onOpenChange={onQuickModeConfirmOpenChange}
        titulo="Preenchimento rápido"
        descricao="Você está abrindo vários casos para o mesmo produto e versão. Deseja manter os dados preenchidos para os próximos e agilizar o envio?"
        cancelarLabel="Não"
        confirmarLabel="Sim, ativar"
        onConfirm={onAcceptQuickMode}
        onCancel={onRefuseQuickMode}
      />

      <CasoFormAnexos
        open={anexosModalOpen}
        onOpenChange={onAnexosModalOpenChange}
        files={attachmentFiles}
        onFilesChange={onAttachmentFilesChange}
        disabled={anexosDisabled}
      />
    </>
  );
}
