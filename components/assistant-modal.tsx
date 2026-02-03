"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Mic, Loader2, Pause, Trash2 } from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSubmit: (data: any) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isAssistantSubmitting: boolean;
}

export function AssistantModal({
  isOpen,
  onClose,
  register,
  handleSubmit,
  onSubmit,
  isRecording: externalIsRecording,
  onToggleRecording: externalOnToggleRecording,
  isAssistantSubmitting,
}: AssistantModalProps) {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    error,
  } = useAudioRecorder();

  // Formatar tempo como MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      if (isPaused) {
        resumeRecording();
      } else {
        pauseRecording();
      }
    } else {
      await startRecording();
    }
  };

  const handleDeleteRecording = () => {
    deleteRecording();
  };

  const handleFormSubmit = async (data: any) => {
    // Se houver áudio gravado, incluir no envio
    const submitData = {
      ...data,
      audio: audioBlob ? {
        blob: audioBlob,
        url: audioUrl,
        duration: recordingTime,
      } : null,
    };
    
    onSubmit(submitData);
    
    // Limpar após envio
    if (audioBlob) {
      deleteRecording();
    }
  };

  // Limpar ao fechar o modal
  useEffect(() => {
    if (!isOpen) {
      if (isRecording) {
        stopRecording();
      }
      deleteRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const hasRecording = audioBlob !== null || isRecording;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Assistente de Voz/Texto IA</DialogTitle>
          </div>
          <DialogDescription>
            Descreva o bug e nós preencheremos o formulário para você
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Recording Bar (aparece quando está gravando ou tem áudio) */}
            {hasRecording && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {/* Botão de deletar */}
                <button
                  type="button"
                  onClick={handleDeleteRecording}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>

                {/* Bolinha vermelha e timer */}
                {isRecording && (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm font-mono text-foreground">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                )}

                {/* Botão pause/resume */}
                {isRecording && (
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors"
                  >
                    {isPaused ? (
                      <Mic className="h-5 w-5 text-primary-foreground" />
                    ) : (
                      <Pause className="h-5 w-5 text-primary-foreground" />
                    )}
                  </button>
                )}

                {/* Indicador de áudio gravado (quando não está gravando mas tem áudio) */}
                {!isRecording && audioBlob && (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatTime(recordingTime)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Áudio gravado
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Text Input with Microphone Button inside */}
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="Descreva o problema com suas próprias palavras... (ex: 'O botão de login não funciona no Safari do iPhone')"
                  className="min-h-[120px] resize-none text-sm pr-12 pb-10"
                  {...register("description")}
                  disabled={isRecording}
                />
                {/* Microphone Button inside textarea */}
                {!hasRecording && (
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className="absolute bottom-2 right-2 flex-shrink-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Mic className="h-5 w-5 text-primary-foreground" />
                  </button>
                )}
              </div>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isAssistantSubmitting}
              >
                {isAssistantSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Preenchendo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Preencher Automaticamente
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
