"use client";

import { useEffect } from "react";
import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormDescricaoCompleta } from "@/components/fields/caso-form-descricao-completa";
import { CasoFormDescricaoResumo } from "@/components/fields/caso-form-descricao-resumo";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormImportancia } from "@/components/fields/caso-form-importancia";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import { FileText, Users } from "lucide-react";
import type { ReportCreateFormData } from "./schema";

export function ReportCreateLeftColumn() {
  const { getValues, register, setValue, watch, formState } =
    useFormContext<ReportCreateFormData>();
  const produtoSelecionado = watch("produto");
  const categoriaSelecionada = watch("categoria");
  const categoriaTipoLabel = watch("categoriaTipoLabel");
  const isCategoriaMelhoria =
    String(categoriaTipoLabel ?? "").trim().toUpperCase() === "MELHORIA";

  const { data: produtos } = useProdutos({
    enabled: Boolean(produtoSelecionado),
  });

  useEffect(() => {
    const produtoId = String(produtoSelecionado ?? "").trim();
    const categoriaTipo = String(categoriaTipoLabel ?? "").trim().toUpperCase();

    if (!produtoId || !categoriaTipo) return;
    const produto = (produtos ?? []).find((item) => String(item.id) === produtoId);
    if (!produto) return;

    let responsavelPadrao: string | null = null;
    if (categoriaTipo === "BUG") {
      responsavelPadrao = produto.responsavel_bugs_suporte_id;
    } else if (categoriaTipo === "MELHORIA") {
      responsavelPadrao = produto.responsavel_melhorias_suporte_id;
    }

    if (!responsavelPadrao) return;
    const valorAtual = String(getValues("reportAnaliseUsuarioId") ?? "").trim();
    if (valorAtual === String(responsavelPadrao)) return;

    setValue("reportAnaliseUsuarioId", String(responsavelPadrao), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [categoriaTipoLabel, getValues, produtoSelecionado, produtos, setValue]);

  const ocorrenciaError = formState.errors.reportOcorrenciaInicial?.message as
    | string
    | undefined;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Informações Gerais
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CasoFormProduto onlyWithPoQaConfigured />
            <CasoFormCategoria
              excludeTipoCategorias={["REQUISITO"]}
              labelName="categoriaTipoLabel"
            />
            <CasoFormImportancia
              tipo="REPORT"
              disabled={!produtoSelecionado || !categoriaSelecionada}
              excludeLabels={isCategoriaMelhoria ? ["Crítico", "Alto"] : []}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-text-label">
                  Ocorrência do Report Inicial
                </Label>
                {ocorrenciaError ? (
                  <p className="text-sm text-destructive">{ocorrenciaError}</p>
                ) : null}
              </div>
              <Input
                placeholder="Informe a OC de report inicial..."
                className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
                {...register("reportOcorrenciaInicial")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Detalhes do report
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-3">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-orange-500" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Responsáveis
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 p-6 pt-3 sm:grid-cols-2">
          <CasoFormDevAtribuido
            name="reportAnaliseUsuarioId"
            labelName="reportAnaliseUsuarioLabel"
            label="Product Owner / QA"
            placeholder="Selecione o responsável pelo produto..."
            requireProduto={false}
          />
          <CasoFormRelator
            name="reportResponsavelSuporteId"
            label="Responsável Suporte"
            placeholder="Selecione o responsável pelo report..."
            required
          />
        </CardContent>
      </Card>
    </div>
  );
}
