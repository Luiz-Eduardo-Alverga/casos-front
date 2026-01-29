"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Mic, Loader2 } from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit, FieldValues } from "react-hook-form";

interface ReportsAssistantProps {
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSubmit: (data: any) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isAssistantSubmitting: boolean;
}

export function ReportsAssistant({
  register,
  handleSubmit,
  onSubmit,
  isRecording,
  onToggleRecording,
  isAssistantSubmitting,
}: ReportsAssistantProps) {

  return (
    <Card className="mb-4 sm:mb-8 shadow-2xl">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Assistente de Voz/Texto IA</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Descreva o bug e nós preencheremos o formulário para você
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={onToggleRecording}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-800 shadow-lg mx-auto sm:mx-0 ${
                isRecording
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              <Mic className={`h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground ${isRecording ? "animate-pulse" : ""}`} />
            </button>

            {/* Text Input */}
            <div className="flex-1 w-full">
              <Textarea
                placeholder="Descreva o problema com suas próprias palavras... (ex: 'O botão de login não funciona no Safari do iPhone')"
                className="min-h-[80px] resize-none text-sm"
                {...register("description")}
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {isRecording ? "🔴 Gravando..." : "Clique no microfone ou digite para descrever o problema"}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs w-full sm:w-auto"
                  disabled={isAssistantSubmitting}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isAssistantSubmitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {isAssistantSubmitting ? " Preenchendo automaticamente..." : "Preencher Automaticamente"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
