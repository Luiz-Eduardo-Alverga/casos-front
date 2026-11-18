"use client";

import { FileText } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TITULO_MAX, type NovoAvisoFormValues } from "./schema";

interface ConteudoCardProps {
  form: UseFormReturn<NovoAvisoFormValues>;
  disabled?: boolean;
}

export function ConteudoCard({ form, disabled }: ConteudoCardProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const auto = watch("auto");

  return (
    <Card className="flex min-w-0 flex-col rounded-lg bg-card shadow-card lg:min-h-0 lg:flex-[3]">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            1 · Conteúdo
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="aviso-titulo" className="text-text-label">
            Título <span className="text-text-error">*</span>
          </Label>
          <Input
            id="aviso-titulo"
            placeholder="Ex.: Liberação do Smart 8.0.14.0"
            maxLength={TITULO_MAX}
            disabled={disabled}
            aria-invalid={!!errors.titulo}
            className={cn(errors.titulo && "border-text-error")}
            {...register("titulo")}
          />
          {errors.titulo ? (
            <p className="text-xs text-text-error">{errors.titulo.message}</p>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Label htmlFor="aviso-descricao" className="text-text-label">
            Descrição <span className="text-text-error">*</span>
          </Label>
          <Textarea
            id="aviso-descricao"
            placeholder="Prezados, ..."
            disabled={disabled}
            aria-invalid={!!errors.descricao}
            className={cn(
              "min-h-[200px] flex-1 resize-none lg:min-h-0",
              errors.descricao && "border-text-error",
            )}
            {...register("descricao")}
          />
          {errors.descricao ? (
            <p className="text-xs text-text-error">
              {errors.descricao.message}
            </p>
          ) : null}
        </div>

        <label
          htmlFor="aviso-auto"
          className="flex shrink-0 items-center justify-between gap-4 rounded-lg border border-border-input bg-muted p-4"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-text-primary">
              Exibir automaticamente
            </p>
            <p className="text-xs text-text-secondary">
              O aviso abre sozinho para o destinatário quando ele entrar no
              Softflow.
            </p>
          </div>
          <Switch
            id="aviso-auto"
            checked={auto}
            disabled={disabled}
            onCheckedChange={(v) => setValue("auto", v, { shouldDirty: true })}
          />
        </label>
      </CardContent>
    </Card>
  );
}
