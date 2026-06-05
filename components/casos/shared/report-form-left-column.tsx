"use client";

import { useEffect } from "react";
import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormDescricaoCompleta } from "@/components/fields/caso-form-descricao-completa";
import { CasoFormDescricaoResumo } from "@/components/fields/caso-form-descricao-resumo";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormImportancia } from "@/components/fields/caso-form-importancia";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { useProdutos } from "@/hooks/catalogos/use-produtos";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { resolveReportPoQaAtribuidoPara } from "@/lib/report/resolve-report-po-qa-atribuido";

export interface ReportFormFields {
  produto: string;
  categoria: string;
  categoriaTipoLabel?: string;
  importancia: string;
  reportOcorrenciaInicial?: string;
  DescricaoResumo: string;
  DescricaoCompleta: string;
  reportAnaliseUsuarioId: string;
  reportResponsavelSuporteId: string;
}

export function ReportFormLeftColumn() {
  const { editCaseItem } = useCasoForm();
  const { getValues, register, setValue, watch, formState } =
    useFormContext<ReportFormFields>();
  const responsavelSuporteNome =
    editCaseItem?.report?.responsavel_feedback_nome?.trim() || undefined;
  const produtoSelecionado = watch("produto");
  const categoriaSelecionada = watch("categoria");
  const categoriaTipoLabel = watch("categoriaTipoLabel");
  const isCategoriaMelhoria =
    String(categoriaTipoLabel ?? "")
      .trim()
      .toUpperCase() === "MELHORIA";

  const { data: produtos } = useProdutos({
    enabled: Boolean(produtoSelecionado),
  });

  useEffect(() => {
    const produtoId = String(produtoSelecionado ?? "").trim();
    if (!produtoId) return;

    const produto = (produtos ?? []).find(
      (item) => String(item.id) === produtoId,
    );
    if (!produto) return;

    const atribuidoPara = resolveReportPoQaAtribuidoPara(
      produto,
      categoriaTipoLabel,
    );
    if (atribuidoPara == null) return;

    const responsavelPadrao = String(atribuidoPara);
    const valorAtual = String(getValues("reportAnaliseUsuarioId") ?? "").trim();
    if (valorAtual === responsavelPadrao) return;

    setValue("reportAnaliseUsuarioId", responsavelPadrao, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [categoriaTipoLabel, getValues, produtoSelecionado, produtos, setValue]);

  const ocorrenciaError = formState.errors.reportOcorrenciaInicial?.message as
    | string
    | undefined;

  const informacoesGeraisPreset = CARD_HEADER_PRESETS.informacoesGerais;
  const detalhesReportPreset = CARD_HEADER_PRESETS.detalhesReport;
  const responsaveisPreset = CARD_HEADER_PRESETS.responsaveis;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Informações Gerais"
          icon={informacoesGeraisPreset.icon}
          iconClassName={informacoesGeraisPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="space-y-2 p-6 pt-2">
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
                className="h-9 rounded-lg border-border-input px-[17px] py-3"
                {...register("reportOcorrenciaInicial")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Detalhes do report"
          icon={detalhesReportPreset.icon}
          iconClassName={detalhesReportPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="space-y-2 p-6 pt-2">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Responsáveis"
          icon={responsaveisPreset.icon}
          iconClassName={responsaveisPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="grid grid-cols-1 gap-4 p-6 pt-2 sm:grid-cols-2">
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
            selectedLabelOverride={responsavelSuporteNome}
          />
        </CardContent>
      </Card>
    </div>
  );
}
