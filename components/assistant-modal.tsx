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
import { Sparkles, Mic, Loader2, Pause, Trash2, Check, Play, Square } from "lucide-react";
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

  // Controle do valor da descrição para validação
  const [description, setDescription] = useState("");

  // Controle de reprodução de áudio
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

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

  const handleStopRecording = async () => {
    if (isRecording) {
      await stopRecording();
    }
  };

  const handleDeleteRecording = async () => {
    // Parar reprodução se estiver tocando
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
    await deleteRecording();
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (!audioElement) {
      // Criar elemento de áudio
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    // Não finaliza automaticamente - usuário deve finalizar manualmente
    const finalAudioBlob = audioBlob;
    
    // Se houver áudio gravado, incluir no envio
    const submitData = {
      ...data,
      audio: finalAudioBlob ? {
        blob: finalAudioBlob,
        url: audioUrl,
        duration: recordingTime,
      } : null,
    };
    
    onSubmit(submitData);
    
    // Limpar após envio
    if (finalAudioBlob) {
      await deleteRecording();
    }
  };

  // Limpar ao fechar o modal
  useEffect(() => {
    if (!isOpen) {
      const cleanup = async () => {
        if (isRecording) {
          await stopRecording();
        }
        // Parar e limpar áudio
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
          setIsPlaying(false);
          setAudioElement(null);
        }
        await deleteRecording();
        setDescription("");
      };
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cleanup do elemento de áudio quando o audioUrl mudar
  useEffect(() => {
    if (!audioUrl && audioElement) {
      audioElement.pause();
      setAudioElement(null);
      setIsPlaying(false);
    }
  }, [audioUrl, audioElement]);

  const hasRecording = audioBlob !== null || isRecording;

  // Validação: deve ter descrição OU áudio gravado (não em gravação)
  const canSubmit = (description.trim() !== "" || audioBlob !== null) && !isAssistantSubmitting;

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

                {/* Botões de controle de gravação */}
                {isRecording && (
                  <div className="flex items-center gap-2">
                    {/* Botão pause/resume */}
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
                    
                    {/* Botão finalizar/salvar (apenas quando pausado) */}
                    {isPaused && (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors"
                        title="Finalizar gravação"
                      >
                        <Check className="h-5 w-5 text-white" />
                      </button>
                    )}
                  </div>
                )}

                {/* Indicador de áudio gravado (quando não está gravando mas tem áudio) */}
                {!isRecording && audioBlob && (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {formatTime(recordingTime)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Áudio gravado
                      </span>
                    </div>
                    
                    {/* Botão para reproduzir áudio */}
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors"
                      title={isPlaying ? "Parar áudio" : "Reproduzir áudio"}
                    >
                      {isPlaying ? (
                        <Square className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Play className="h-5 w-5 text-primary-foreground" />
                      )}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Text Input with Microphone Button inside */}
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="Descreva o problema com suas próprias palavras... (ex: 'O botão de login não funciona no Safari do iPhone')"
                  className="min-h-[120px] resize-none text-sm pr-12 pb-10"
                  {...register("description", {
                    onChange: (e) => setDescription(e.target.value)
                  })}
                  disabled={isRecording || isPaused}
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
                disabled={!canSubmit}
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
