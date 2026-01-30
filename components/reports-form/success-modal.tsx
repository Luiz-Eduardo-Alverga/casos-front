"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  numeroCaso: number | null;
}

export function SuccessModal({ isOpen, onClose, numeroCaso }: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!numeroCaso) return;

    try {
      await navigator.clipboard.writeText(String(numeroCaso));
      setCopied(true);
      toast.success("Número do caso copiado!");
      
      // Resetar o estado de copiado após 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error("Erro ao copiar número do caso");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only"></DialogTitle>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col justify-center pt-6 space-y-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.5,
            }}
          >
            <Image
              src="/images/success.svg"
              alt="Sucesso"
              width={150}
              height={58}
              className="mx-auto"
              unoptimized
            />
          </motion.div>
          {numeroCaso && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-center space-y-4"
            >
              <div>
                <h1 className="text-2xl font-bold">Tudo certo!</h1>
                <h2 className="text-lg mt-2">
                  Caso <span className="font-bold text-primary">{numeroCaso}</span> aberto com sucesso!
                </h2>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar número
                    </>
                  )}
                </Button>
                <Button className="flex-1" onClick={onClose}>
                  Voltar para o início
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
