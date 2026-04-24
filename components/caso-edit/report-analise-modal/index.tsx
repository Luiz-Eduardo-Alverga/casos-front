"use client";

import {
  Sparkles,
  X,
  Save,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";

import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormStatus } from "@/components/fields/caso-form-status";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatReportDate } from "./utils";
import type { ReportAnaliseModalProps } from "./types";

interface ReportReadonlyFieldProps {
  label: string;
  value: string;
}

const ReportReadonlyField = ({ label, value }: ReportReadonlyFieldProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-label">{label}</p>
      <Input value={value} readOnly disabled />
    </div>
  );
};

export function ReportAnaliseModal({
  open,
  onOpenChange,
  report,
  onSalvar,
  isLoading = false,
  disabled = false,
}: ReportAnaliseModalProps) {
  const analiseConcluida = report.analise_concluida !== false;
  const dataLimite = formatReportDate(report.data_limite);
  const responsavelFeedback = report.responsavel_feedback_nome?.trim() || "—";
  const dataConclusao = formatReportDate(report.analise_data_conclusao);
  const { control } = useFormContext();
  const analiseStatusValue = useWatch({ control, name: "analiseStatus" });

  const analiseStatusId = useMemo(() => {
    return String(analiseStatusValue ?? "").trim();
  }, [analiseStatusValue]);

  const isStatusStepByStep =
    analiseStatusId === "20" || analiseStatusId === "22";
  const isStepFlow = !analiseConcluida && isStatusStepByStep;
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!open) {
      setStep(1);
      return;
    }
    if (!isStepFlow) {
      setStep(1);
    }
  }, [open, isStepFlow]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Análise report</DialogTitle>
      <DialogContent className="max-h-[90vh] w-[min(96vw,560px)] max-w-[560px] min-w-0 overflow-y-auto overflow-x-hidden p-0">
        <div className="min-w-0 rounded-lg border border-border-divider bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 border-b border-border-divider pb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-xl font-semibold text-text-primary">
              Análise Report
            </h3>
          </div>

          <div className="min-w-0 space-y-5 py-5">
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label className="text-sm font-medium text-text-label">
                  Prioridade
                </Label>
                <Controller
                  name="reportPrioridade"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v ?? "")}
                      disabled
                    >
                      <SelectTrigger className="min-w-0">
                        <SelectValue placeholder="Selecione a prioridade..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critico">Crítico</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Medio">Médio</SelectItem>
                        <SelectItem value="Baixo">Baixo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <ReportReadonlyField label="Data limite" value={dataLimite} />
            </div>

            <ReportReadonlyField
              label="Responsável Feedback"
              value={responsavelFeedback}
            />

            <CasoFormStatus
              name="analiseStatus"
              label="Status Report"
              tipoStatus="REPORT"
              required
              disabled={disabled}
            />

            {analiseConcluida ? (
              <div className="min-w-0 space-y-4">
                <Separator />
                <ReportReadonlyField
                  label="Data de Conclusão"
                  value={dataConclusao}
                />
                <div className="sr-only">
                  <ReportReadonlyField label="Usuário Conclusão" value="—" />
                </div>
              </div>
            ) : isStepFlow && step === 2 ? (
              <div className="min-w-0 space-y-4">
                <CasoFormVersao todas={false} />
                <CasoFormProjeto />
                <CasoFormDevAtribuido />
                <CasoFormModulo required={false} />
              </div>
            ) : null}
          </div>

          {analiseConcluida ? (
            <div className="flex min-w-0 w-full gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onSalvar}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          ) : isStepFlow ? (
            step === 1 ? (
              <div className="flex min-w-0 w-full gap-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isLoading || disabled}
                  className="flex-1"
                >
                  <ArrowRight className="h-3.5 w-3.5 mr-2" />
                  Avançar
                </Button>
              </div>
            ) : (
              <div className="flex min-w-0 w-full gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading || disabled}
                  className="flex-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </Button>
                <Button
                  type="button"
                  onClick={onSalvar}
                  disabled={isLoading || disabled}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            )
          ) : (
            <div className="flex min-w-0 w-full gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onSalvar}
                disabled={isLoading || disabled}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
