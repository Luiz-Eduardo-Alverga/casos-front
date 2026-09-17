"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CasoFormProvider } from "@/components/fields/caso-form-provider";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getUser } from "@/lib/auth";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { useRelatores } from "@/hooks/catalogos/use-usuarios";
import { useProdutos as useProdutosCatalogo } from "@/hooks/catalogos/use-produtos";
import { useUpdateProduto } from "@/hooks/produtos/use-update-produto";
import { useProdutoPermissoes } from "@/hooks/produtos/use-produto-permissoes";
import type { ProdutoData } from "@/services/produtos/produtos";
import {
  getProdutoCreateDefaultValues,
  produtoFormSchema,
  type ProdutoFormData,
} from "@/components/produtos/cadastro/schema";
import {
  buildUpdateProdutoPayload,
  colaboradorLabelById,
  formValueToColaboradorNome,
  formValueToSetorNome,
  produtoToFormValues,
  produtoToPayload,
} from "@/components/produtos/cadastro/utils";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { AbaDadosGerais } from "@/components/produtos/edicao/abas/aba-dados-gerais";
import { AbaChecklist } from "@/components/produtos/edicao/checklist";
import { AbaModulos } from "@/components/produtos/edicao/modulos";
import { AbaScripts } from "@/components/produtos/edicao/scripts";
import { AbaVersoes } from "@/components/produtos/edicao/versoes";
import { ProdutoAcoesCard } from "@/components/produtos/edicao/produto-acoes-card";
import {
  ProdutoEditHeader,
  PRODUTO_EDIT_ASIDE_WIDTH_CLASS,
} from "@/components/produtos/edicao/produto-edit-header";
import { ProdutoResumoCard } from "@/components/produtos/edicao/produto-resumo-card";
import {
  PRODUTO_EDIT_TABS,
  produtoEditTabParser,
  type ProdutoEditTab,
} from "@/components/produtos/edicao/produto-edit-url-parsers";
import { cn } from "@/lib/utils";

const FORM_ID = "produto-edit-form";

const TAB_CONTENT_CLASS =
  "mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden";

export interface ProdutoEditFormProps {
  produto: ProdutoData;
}

export function ProdutoEditForm({ produto }: ProdutoEditFormProps) {
  const router = useRouter();
  const user = useMemo(() => getUser(), []);
  const { canEdit } = useProdutoPermissoes();
  const { data: setores } = useSetores({ enabled: true });
  const { data: usuarios } = useRelatores({ enabled: true });
  const { data: produtosCatalogo } = useProdutosCatalogo({ enabled: true });
  const updateProduto = useUpdateProduto();

  const [activeTab, setActiveTabQuery] = useQueryState(
    "aba",
    produtoEditTabParser.withOptions({ history: "replace", shallow: false }),
  );
  const [pendingNav, setPendingNav] = useState<ProdutoEditTab | "leave" | null>(
    null,
  );
  const [desativarOpen, setDesativarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const methods = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: getProdutoCreateDefaultValues(),
  });

  const mappingContext = useMemo(
    () => ({ setores, usuarios, currentUser: user }),
    [setores, usuarios, user],
  );

  const isDirtyRef = useRef(methods.formState.isDirty);
  isDirtyRef.current = methods.formState.isDirty;

  useEffect(() => {
    if (isDirtyRef.current) return;
    methods.reset(produtoToFormValues(produto, mappingContext));
  }, [produto, mappingContext, methods.reset]);

  const watched = useWatch({ control: methods.control });
  const isDirty = methods.formState.isDirty;
  const isSaving = methods.formState.isSubmitting || updateProduto.isPending;

  const goToTab = useCallback(
    (value: ProdutoEditTab) => {
      void setActiveTabQuery(value === "dados" ? null : value);
    },
    [setActiveTabQuery],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      if (!PRODUTO_EDIT_TABS.includes(value as ProdutoEditTab)) return;
      const next = value as ProdutoEditTab;
      if (activeTab === "dados" && isDirty && next !== "dados" && canEdit) {
        setPendingNav(next);
        return;
      }
      goToTab(next);
    },
    [activeTab, isDirty, canEdit, goToTab],
  );

  const handleBack = useCallback(() => {
    if (isDirty && canEdit) {
      setPendingNav("leave");
      return;
    }
    router.push("/produtos");
  }, [isDirty, canEdit, router]);

  function handleDiscard() {
    methods.reset(produtoToFormValues(produto, mappingContext));
  }

  async function onSubmit(data: ProdutoFormData) {
    if (!canEdit) {
      toast.error("Você não possui permissão para editar este produto.");
      return;
    }
    try {
      const payload = buildUpdateProdutoPayload(data, produto, mappingContext);
      const response = await updateProduto.mutateAsync({
        id: produto.Registro,
        data: payload,
      });
      toast.success(response.message || PRODUTO_LABELS.atualizadoSucesso);
      const saved = response.data ?? { ...produto, ...payload, Registro: produto.Registro };
      methods.reset(produtoToFormValues(saved, mappingContext));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : PRODUTO_LABELS.erroAtualizar,
      );
    }
  }

  async function handleToggleAtivo() {
    try {
      const payload = {
        ...produtoToPayload(produto),
        Desativado: !produto.Desativado,
      };
      const response = await updateProduto.mutateAsync({
        id: produto.Registro,
        data: payload,
      });
      toast.success(response.message || PRODUTO_LABELS.atualizadoSucesso);
      if (response.data) {
        methods.reset(produtoToFormValues(response.data, mappingContext));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : PRODUTO_LABELS.erroAtualizar,
      );
    }
  }

  const vinculadoNome = useMemo(() => {
    const id = watched.vinculadoA?.trim();
    if (!id) return "";
    const found = produtosCatalogo?.find((item) => String(item.id) === id);
    return found?.nome_projeto?.trim() || `#${id}`;
  }, [watched.vinculadoA, produtosCatalogo]);

  const nomeExibido = watched.nomeProjeto?.trim() || produto.NomeProjeto;

  const resumoValues = {
    nome: nomeExibido,
    registro: produto.Registro,
    statusDesativado: produto.Desativado,
    vacaLeiteira: Boolean(watched.vacaLeiteira),
    somenteLeitura: !canEdit,
    po: formValueToColaboradorNome(
      watched.po,
      usuarios,
      user,
      produto.PO,
    ),
    scrumMaster: formValueToColaboradorNome(
      watched.scrumMaster,
      usuarios,
      user,
      produto.ScrumMaster,
    ),
    setor: formValueToSetorNome(watched.setor, setores, produto.Setor),
    suporte: formValueToSetorNome(
      watched.responsavelSuporte,
      setores,
      produto.Responsavel_Suporte,
    ),
    parametrizacao: formValueToSetorNome(
      watched.responsavelParametrizacao,
      setores,
      produto.Responsavel_Parametrizacao,
    ),
    bugs:
      formValueToColaboradorNome(watched.responsavelBugs, usuarios, user) ||
      colaboradorLabelById(
        produto.responsavel_bugs_suporte_id,
        usuarios,
        user,
      ),
    melhorias:
      formValueToColaboradorNome(
        watched.responsavelMelhorias,
        usuarios,
        user,
      ) ||
      colaboradorLabelById(
        produto.responsavel_melhorias_suporte_id,
        usuarios,
        user,
      ),
    vinculadoA: vinculadoNome,
    dataCadastro: produto.DataProjeto,
  };

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions: [],
      isDisabled: isSaving || !canEdit,
      lazyLoadComboboxOptions: false,
    }),
    [methods, isSaving, canEdit],
  );

  return (
    <div className="flex flex-1 flex-col overflow-auto px-6 pb-10 pt-20">
      <CasoFormProvider value={providerValue}>
        <FormProvider {...methods}>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex min-h-0 flex-1 flex-col"
          >
            {!isDesktop ? (
              <div className="mb-6">
                <ProdutoResumoCard values={resumoValues} compact />
              </div>
            ) : null}

            <ProdutoEditHeader
              onBack={handleBack}
              canEdit={canEdit}
              isSaving={isSaving}
              formId={FORM_ID}
            />

            <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 lg:flex-row lg:items-start">
              <div className="flex min-w-0 flex-1 flex-col">
                <TabsContent
                  value="dados"
                  forceMount
                  className={TAB_CONTENT_CLASS}
                >
                  <form
                    id={FORM_ID}
                    onSubmit={methods.handleSubmit(onSubmit, () => {
                      toast.error(PRODUTO_LABELS.reviseObrigatorios);
                    })}
                  >
                    <AbaDadosGerais
                      somenteLeitura={!canEdit}
                      setorLabel={produto.Setor}
                      poLabel={produto.PO}
                      scrumMasterLabel={produto.ScrumMaster}
                      suporteLabel={produto.Responsavel_Suporte}
                      parametrizacaoLabel={produto.Responsavel_Parametrizacao}
                      bugsLabel={
                        produto.responsavel_bugs_suporte_id
                          ? colaboradorLabelById(
                              produto.responsavel_bugs_suporte_id,
                              usuarios,
                              user,
                            )
                          : undefined
                      }
                      melhoriasLabel={
                        produto.responsavel_melhorias_suporte_id
                          ? colaboradorLabelById(
                              produto.responsavel_melhorias_suporte_id,
                              usuarios,
                              user,
                            )
                          : undefined
                      }
                    />
                  </form>
                </TabsContent>

                <TabsContent value="versoes" className={TAB_CONTENT_CLASS}>
                  <AbaVersoes
                    produtoId={produto.Registro}
                    enabled={activeTab === "versoes"}
                  />
                </TabsContent>
                <TabsContent value="modulos" className={TAB_CONTENT_CLASS}>
                  <AbaModulos
                    produtoId={produto.Registro}
                    enabled={activeTab === "modulos"}
                  />
                </TabsContent>
                <TabsContent value="checklist" className={TAB_CONTENT_CLASS}>
                  <AbaChecklist
                    produtoId={produto.Registro}
                    enabled={activeTab === "checklist"}
                  />
                </TabsContent>
                <TabsContent value="scripts" className={TAB_CONTENT_CLASS}>
                  <AbaScripts
                    produtoId={produto.Registro}
                    enabled={activeTab === "scripts"}
                  />
                </TabsContent>
              </div>

              {isDesktop ? (
                <aside
                  className={cn(
                    "flex w-full shrink-0 flex-col gap-2 lg:sticky lg:top-0 lg:self-start",
                    PRODUTO_EDIT_ASIDE_WIDTH_CLASS,
                  )}
                >
                  <ProdutoResumoCard values={resumoValues} />
                  {canEdit ? (
                    <ProdutoAcoesCard
                      desativado={produto.Desativado}
                      onToggle={() => setDesativarOpen(true)}
                      disabled={isSaving}
                    />
                  ) : null}
                </aside>
              ) : canEdit ? (
                <ProdutoAcoesCard
                  desativado={produto.Desativado}
                  onToggle={() => setDesativarOpen(true)}
                  disabled={isSaving}
                />
              ) : null}
            </div>
          </Tabs>

          <ConfirmacaoModal
            open={pendingNav != null}
            onOpenChange={(open) => {
              if (!open) setPendingNav(null);
            }}
            titulo={PRODUTO_LABELS.descartarTitulo}
            descricao={PRODUTO_LABELS.descartarDescricao}
            confirmarLabel={PRODUTO_LABELS.descartar}
            cancelarLabel={PRODUTO_LABELS.continuarEditando}
            variant="danger"
            onConfirm={() => {
              handleDiscard();
              if (pendingNav === "leave") {
                router.push("/produtos");
              } else if (pendingNav) {
                goToTab(pendingNav);
              }
              setPendingNav(null);
            }}
          />

          <ConfirmacaoModal
            open={desativarOpen}
            onOpenChange={setDesativarOpen}
            titulo={
              produto.Desativado
                ? PRODUTO_LABELS.reativarTitulo
                : PRODUTO_LABELS.desativarTitulo
            }
            descricao={
              produto.Desativado
                ? PRODUTO_LABELS.reativarDescricao
                : PRODUTO_LABELS.desativarDescricao
            }
            confirmarLabel={
              produto.Desativado
                ? PRODUTO_LABELS.reativarProduto
                : PRODUTO_LABELS.desativarProduto
            }
            cancelarLabel={PRODUTO_LABELS.cancelar}
            variant={produto.Desativado ? "default" : "danger"}
            isLoading={updateProduto.isPending}
            onConfirm={handleToggleAtivo}
          />
        </FormProvider>
      </CasoFormProvider>
    </div>
  );
}
