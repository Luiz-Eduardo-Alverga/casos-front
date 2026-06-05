"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ModalLottieIcon } from "@/components/modal-lottie-icon";

export interface EditCasoOuReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numeroCaso: string | number;
  onSelectCase: () => void;
  onSelectReport: () => void;
}

export function EditCasoOuReportModal({
  open,
  onOpenChange,
  numeroCaso,
  onSelectCase,
  onSelectReport,
}: EditCasoOuReportModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Como deseja editar?</DialogTitle>
        <div className="flex flex-col justify-center pt-6 space-y-4">
          <ModalLottieIcon variant="question" playKey={open} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center space-y-4"
          >
            <div>
              <p className="text-xl font-bold">Como deseja editar?</p>
              <p className="text-lg mt-2 text-text-secondary">
                Você possui acesso aos dois modos de edição. Escolha como abrir
                o registro{" "}
                <span className="font-bold text-primary">#{numeroCaso}</span>.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={onSelectCase}>Editar como caso</Button>
              <Button variant="outline" onClick={onSelectReport}>
                Editar como Report
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
