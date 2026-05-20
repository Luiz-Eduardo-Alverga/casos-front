"use client";

import { FileText } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CasoFormSgpObjetivo } from "@/components/fields/caso-form-sgp-objetivo";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import type { ProjetoCreateFormData } from "@/components/projetos/cadastro/schema";

export function ProjetoCreateRightColumn() {
  const { isDisabled } = useCasoForm();
  const { register } = useFormContext<ProjetoCreateFormData>();

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Card className=" rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Planeamento Estratégico
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-3">
          <CasoFormSgpObjetivo required={false} />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-label">
              Metodologia / Ciclo de Vida
            </Label>
            <Textarea
              placeholder="Descreva detalhadamente o caso, incluindo contexto, passos para reproduzir e comportamento esperado..."
              className="min-h-[120px] rounded-lg border-border-input resize-y"
              disabled={isDisabled}
              {...register("necessidades")}
            />
            <p className="text-xs text-text-secondary">
              Deverá ser observado processo atual, coletando documentos e
              formulários, ver possibilidades do desenho do Fluxograma
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-text-label">
              Expectativas ou Objetivos
            </Label>
            <Textarea
              placeholder="Informações complementares, links, etc..."
              className="min-h-[120px] rounded-lg border-border-input resize-y"
              disabled={isDisabled}
              {...register("expectativas")}
            />
            <p className="text-xs text-text-secondary">
              Ex: Aumento da Qualidade / Satisfação do cliente / Eficiência dos
              processos internos / Aumento da Produção / Ganho de concorrência
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
