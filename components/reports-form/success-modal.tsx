"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Copy, Check, Plus, List } from "lucide-react";
import { ModalLottieIcon } from "@/components/modal-lottie-icon";
import toast from "react-hot-toast";
import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeroCaso: number | null;
  /** Chamado ao clicar em &quot;Novo caso&quot; (antes de fechar), ex.: persistir LocalStorage. */
  onNovoCasoClick?: () => void;
  /** Rótulo da entidade no texto principal (ex.: Report). Padrão: Caso */
  entitySingular?: string;
  /** Texto do botão para abrir outro registro. Padrão: Novo caso */
  novoRegistroButtonLabel?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  numeroCaso,
  onNovoCasoClick,
  entitySingular = "Caso",
  novoRegistroButtonLabel = "Novo caso",
}: SuccessModalProps) {
  const { reset } = useFormContext();
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      // Resetar progresso quando o modal fechar
      setProgress(100);
      return;
    }

    // Resetar progresso quando o modal abrir
    setProgress(100);

    const duration = 15000; // 15 segundos
    const interval = 50; // Atualizar a cada 50ms para suavidade
    const steps = duration / interval;
    const decrement = 100 / steps;

    // Intervalo para atualizar o progresso
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, interval);

    // Timeout para fechar o modal após 15 segundos
    timeoutRef.current = setTimeout(() => {
      onClose();
      reset();
    }, duration);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, onClose, reset]);

  const handleCopy = async () => {
    if (!numeroCaso) return;

    try {
      await navigator.clipboard.writeText(String(numeroCaso));
      setCopied(true);
      toast.success(`Número do ${entitySingular.toLowerCase()} copiado!`);

      // Resetar o estado de copiado após 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error(`Erro ao copiar número do ${entitySingular.toLowerCase()}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only"></DialogTitle>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col justify-center pt-6 space-y-4">
          <ModalLottieIcon variant="success" playKey={isOpen} />
          {numeroCaso && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-center space-y-4"
            >
              <div>
                <h1 className="text-xl font-bold">Tudo certo!</h1>
                <h2 className="text-lg mt-2">
                  {entitySingular}{" "}
                  <span className="font-bold text-primary">{numeroCaso}</span>{" "}
                  aberto com sucesso!
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar número
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    onNovoCasoClick?.();
                    onClose();
                  }}
                >
                  <>
                    <Plus className="h-4 w-4 " />
                    {novoRegistroButtonLabel}
                  </>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/casos/${numeroCaso}`)}
                >
                  <List className="h-4 w-4" />
                  Ver Detalhes
                </Button>
              </div>
            </motion.div>
          )}
        </div>
        {/* Barra de progresso no canto inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-lg overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
