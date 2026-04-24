"use client";

import { Info } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RoleInfoFormValues } from "./types";

/**
 * Card "Informações Gerais" com `Nome do Papel` e `Descrição / Objetivo`.
 * Usa `useFormContext` — o `FormProvider` é fornecido pelo entrypoint.
 */
export function RoleInfoCard() {
  const { control } = useFormContext<RoleInfoFormValues>();
  return (
    <Card className="bg-card shadow-card rounded-lg">
      <CardHeader className="p-5 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Informações Gerais
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="role-info-name"
            className="text-xs font-medium text-text-label"
          >
            Nome do Papel
          </label>
          <Controller
            control={control}
            name="name"
            rules={{
              required: "Informe o nome do papel",
              minLength: { value: 2, message: "Mínimo de 2 caracteres" },
            }}
            render={({ field, fieldState }) => (
              <>
                <Input
                  id="role-info-name"
                  {...field}
                  placeholder="Ex.: Administrador"
                />
                {fieldState.error && (
                  <p className="text-xs text-text-error">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="role-info-description"
            className="text-xs font-medium text-text-label"
          >
            Descrição / Objetivo
          </label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Textarea
                id="role-info-description"
                {...field}
                placeholder="Descreva o propósito deste papel"
                rows={3}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
