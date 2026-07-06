"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Mic,
  Loader2,
  Pause,
  Trash2,
  Check,
  Play,
  Square,
  Info,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { useAudioRecorder } from "@/hooks/assistant/use-audio-recorder";
import { useFormAssistantPrompts } from "@/hooks/assistant/use-form-assistant-prompts";
import { getUser } from "@/lib/auth";
import type { FormAssistantPrompt } from "@/lib/types/form-assistant-prompts";
import { AssistantPromptPreview } from "./assistant-prompt-preview";

const DEFAULT_PROMPT_KEY = "__default__";

function promptOptionKey(prompt: FormAssistantPrompt): string {
  return prompt.squadSetor ?? DEFAULT_PROMPT_KEY;
}

function squadSetorFromOptionKey(key: string): string | null {
  return key === DEFAULT_PROMPT_KEY ? null : key;
}

function promptOptionLabel(prompt: FormAssistantPrompt): string {
  if (prompt.squadSetor === null) {
    return prompt.name;
  }
  return `${prompt.squadSetor} — ${prompt.name}`;
}

function promptHelperText(prompt: FormAssistantPrompt | null): string {
  if (!prompt) return "";
  if (prompt.squadSetor === null) return "Prompt padrão global.";
  return `Prompt exclusivo do ${prompt.squadSetor}.`;
}

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSubmit: (data: any) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isAssistantSubmitting: boolean;
  /** Quando true, usa sempre o prompt padrão e oculta o Select de prompts. */
  useDefaultPromptOnly?: boolean;
}

export function AssistantModal({
  isOpen,
  onClose,
  register,
  handleSubmit,
  onSubmit,
  isAssistantSubmitting,
  useDefaultPromptOnly = false,
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

  const [description, setDescription] = useState("");
  const [selectedPromptKey, setSelectedPromptKey] =
    useState<string>(DEFAULT_PROMPT_KEY);

  const user = getUser();
  const { data: prompts, isLoading: isLoadingPrompts } =
    useFormAssistantPrompts();

  const activePrompts = useMemo(
    () => (prompts ?? []).filter((prompt) => prompt.isActive),
    [prompts],
  );

  const selectedPrompt = useMemo(() => {
    if (activePrompts.length === 0) return null;
    return (
      activePrompts.find(
        (prompt) => promptOptionKey(prompt) === selectedPromptKey,
      ) ??
      activePrompts.find((prompt) => prompt.squadSetor === null) ??
      activePrompts[0]
    );
  }, [activePrompts, selectedPromptKey]);

  useEffect(() => {
    if (!isOpen) return;

    if (useDefaultPromptOnly) {
      setSelectedPromptKey(DEFAULT_PROMPT_KEY);
      return;
    }

    if (activePrompts.length === 0) return;

    const userSetor = user?.setor?.trim();
    const squadPrompt = userSetor
      ? activePrompts.find((prompt) => prompt.squadSetor === userSetor)
      : undefined;

    setSelectedPromptKey(
      squadPrompt ? promptOptionKey(squadPrompt) : DEFAULT_PROMPT_KEY,
    );
  }, [isOpen, activePrompts, user?.setor, useDefaultPromptOnly]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );

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
      const audio = new Audio(audioUrl);
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
      });
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    } else if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleFormSubmit = async (data: any) => {
    const finalAudioBlob = audioBlob;

    const submitData = {
      ...data,
      squadSetor: squadSetorFromOptionKey(selectedPromptKey),
      audio: finalAudioBlob
        ? {
            blob: finalAudioBlob,
            url: audioUrl,
            duration: recordingTime,
          }
        : null,
    };

    onSubmit(submitData);

    if (finalAudioBlob) {
      await deleteRecording();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      const cleanup = async () => {
        if (isRecording) {
          await stopRecording();
        }
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
          setIsPlaying(false);
          setAudioElement(null);
        }
        await deleteRecording();
        setDescription("");
        setSelectedPromptKey(DEFAULT_PROMPT_KEY);
      };
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!audioUrl && audioElement) {
      audioElement.pause();
      setAudioElement(null);
      setIsPlaying(false);
    }
  }, [audioUrl, audioElement]);

  const hasRecording = audioBlob !== null || isRecording;
  const canSubmit =
    (description.trim() !== "" || audioBlob !== null) && !isAssistantSubmitting;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden border-border-divider p-0 sm:max-w-[960px]"
      >
        <div className="shrink-0 border-b border-border-divider px-6 py-4">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-gradient-start to-gradient-end">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <SheetTitle className="text-lg font-bold text-text-primary">
                Assistente de Voz/Texto IA
              </SheetTitle>
              <SheetDescription className="text-sm text-text-secondary">
                Descreva o caso e nós preencheremos o formulário para você.
              </SheetDescription>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex min-h-0 flex-1 overflow-hidden lg:flex-row lg:divide-x lg:divide-border-divider">
            {/* Coluna esquerda — relato */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden p-6">
              <Label className="shrink-0 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Descreva o problema
              </Label>

              {hasRecording && (
                <div className="flex shrink-0 items-center gap-3 rounded-lg bg-muted p-3">
                  <button
                    type="button"
                    onClick={handleDeleteRecording}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>

                  {isRecording && (
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
                      <span className="font-mono text-sm text-foreground">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleRecording}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary transition-colors hover:bg-primary/90"
                      >
                        {isPaused ? (
                          <Mic className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Pause className="h-5 w-5 text-primary-foreground" />
                        )}
                      </button>
                      {isPaused && (
                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 transition-colors hover:bg-green-700"
                          title="Finalizar gravação"
                        >
                          <Check className="h-5 w-5 text-white" />
                        </button>
                      )}
                    </div>
                  )}

                  {!isRecording && audioBlob && (
                    <>
                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="font-mono text-sm text-muted-foreground">
                          {formatTime(recordingTime)}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          Áudio gravado
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePlayPause}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary transition-colors hover:bg-primary/90"
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

              <div className="relative flex min-h-0 flex-1 flex-col">
                <Textarea
                  placeholder="Descreva o problema com suas próprias palavras... (ex: 'O botão de login não funciona no Safari do iPhone')"
                  className="h-full min-h-0 flex-1 resize-none rounded-lg border-border-input px-4 py-3 pr-12 text-base"
                  {...register("description", {
                    onChange: (e) => setDescription(e.target.value),
                  })}
                  disabled={isRecording || isPaused}
                />
                {/* {!hasRecording && (
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
                  >
                    <Mic className="h-5 w-5 text-primary-foreground" />
                  </button>
                )} */}
              </div>

              {error && (
                <p className="shrink-0 text-xs text-destructive">{error}</p>
              )}

              <div className="flex shrink-0 gap-2 rounded-lg border border-border-divider bg-indigo-50/30 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <p className="text-xs leading-relaxed text-indigo-500">
                  O assistente usa as regras do prompt selecionado ao lado para
                  identificar categoria, título e descrição. Produtos, usuários
                  e o restante do formulário são preenchidos automaticamente a
                  partir do relato.
                </p>
              </div>
            </div>

            {/* Coluna direita — prompt */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden bg-muted/20 p-6 lg:w-[360px] lg:shrink-0 lg:flex-none">
              <div className="shrink-0 space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Prompt do assistente
                </Label>

                {useDefaultPromptOnly ? (
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-border-input bg-card px-3">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate text-sm font-medium text-text-primary">
                      {selectedPrompt?.name ?? "Prompt padrão"}
                    </span>
                  </div>
                ) : (
                  <Select
                    value={selectedPromptKey}
                    onValueChange={setSelectedPromptKey}
                    disabled={
                      isLoadingPrompts ||
                      isAssistantSubmitting ||
                      activePrompts.length === 0
                    }
                  >
                    <SelectTrigger className="w-full bg-card">
                      <SelectValue
                        placeholder={
                          isLoadingPrompts
                            ? "Carregando prompts..."
                            : "Selecione um prompt"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {activePrompts.map((prompt) => (
                        <SelectItem
                          key={prompt.id}
                          value={promptOptionKey(prompt)}
                        >
                          {promptOptionLabel(prompt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <p className="text-xs text-text-secondary">
                  {isLoadingPrompts
                    ? "Carregando informações do prompt..."
                    : promptHelperText(selectedPrompt)}
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Estrutura do prompt
                  </span>
                  {selectedPrompt?.id && !useDefaultPromptOnly && (
                    <Link
                      href={`/configuracoes/prompts-ia/${selectedPrompt.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:underline"
                    >
                      Editar
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {isLoadingPrompts ? (
                  <div className="rounded-lg border border-border-divider bg-card p-4 text-xs text-text-secondary">
                    Carregando template...
                  </div>
                ) : (
                  <AssistantPromptPreview
                    template={selectedPrompt?.template ?? ""}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border-divider px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isAssistantSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preenchendo...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Preencher Automaticamente
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
