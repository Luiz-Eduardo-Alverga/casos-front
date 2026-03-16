"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useUpdateCaso } from "@/hooks/use-update-caso";
import { useClonarCaso } from "@/hooks/use-clonar-caso";
import { useDeleteCaso } from "@/hooks/use-delete-caso";
import { useCreateAnotacao } from "@/hooks/use-create-anotacao";
import { useUpdateAnotacao } from "@/hooks/use-update-anotacao";
import { useDeleteAnotacao } from "@/hooks/use-delete-anotacao";
import { useCreateClienteCaso } from "@/hooks/use-create-cliente-caso";
import { useDeleteClienteCaso } from "@/hooks/use-delete-cliente-caso";

import { CasoFormProvider } from "@/components/caso-form";
import { importanceOptions } from "@/mocks/teste";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { CasoEditHeader } from "./caso-edit-header";
import { CasoEditRodapeAcoes } from "./caso-edit-rodape-acoes";
import { CasoEditColunaDireita } from "./caso-edit-coluna-direita";
import { CasoEditCardClassificacao } from "./caso-edit-card-classificacao";
import { AbaInicial } from "./aba-inicial";
import { AbaAnotacoes } from "./aba-anotacoes";
import { AbaRelacoes } from "./aba-relacoes";
import { AbaClientes } from "./aba-clientes";
import { AbaProducao } from "./aba-producao";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { UpdateCasoRequest } from "@/services/projeto-casos/update";

const editFormSchema = z.object({
  produto: z.string().min(1, "Produto é obrigatório"),
  importancia: z.string().min(1, "Importância é obrigatória"),
  modulo: z.string(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  devAtribuido: z.string().min(1, "Dev atribuído é obrigatório"),
  versao: z.string().min(1, "Versão é obrigatória"),
  projeto: z.string().min(1, "Projeto é obrigatório"),
  origem: z.string().min(1, "Origem é obrigatória"),
  relator: z.string().min(1, "Relator é obrigatório"),
  qaAtribuido: z.string(),
  DescricaoResumo: z.string().min(1, "Resumo é obrigatório"),
  DescricaoCompleta: z.string().min(1, "Descrição completa é obrigatória"),
  InformacoesAdicionais: z.string().optional(),
  status: z.string().min(1, "Status é obrigatório"),
});

type EditFormData = z.infer<typeof editFormSchema>;

function getDefaultValues(item: ProjetoMemoriaItem): EditFormData {
  const { caso, produto, projeto } = item;
  const qaId = caso?.usuarios?.qa?.id;
  const qaAtribuido =
    qaId === 0 || qaId === "0" || qaId == null ? "" : String(qaId);
  return {
    produto: String(produto?.id ?? ""),
    importancia: String(caso?.caracteristicas?.prioridade ?? "3"),
    modulo: caso?.caracteristicas?.modulo ?? "",
    categoria: String(caso?.caracteristicas?.categoria ?? "4"),
    devAtribuido: String(caso?.usuarios?.desenvolvimento?.id ?? ""),
    versao: produto?.versao != null ? String(produto.versao) : "",
    projeto: String(projeto?.id ?? ""),
    origem: String(caso?.caracteristicas?.id_origem ?? "4"),
    relator: String(caso?.usuarios?.relator?.id ?? ""),
    qaAtribuido: qaAtribuido,
    DescricaoResumo: caso?.textos?.descricao_resumo ?? "",
    DescricaoCompleta: caso?.textos?.descricao_completa ?? "",
    InformacoesAdicionais: caso?.textos?.informacoes_adicionais ?? "",
    status: String(caso?.status?.status_id ?? "1"),
  };
}

const fallbackDefaults: EditFormData = {
  produto: "",
  importancia: "3",
  modulo: "",
  categoria: "4",
  devAtribuido: "",
  versao: "",
  projeto: "",
  origem: "4",
  relator: "",
  qaAtribuido: "",
  DescricaoResumo: "",
  DescricaoCompleta: "",
  InformacoesAdicionais: "",
  status: "1",
};

export interface CasoEditFormProps {
  item: ProjetoMemoriaItem;
  casoId: string;
}

export function CasoEditForm({ item, casoId }: CasoEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState("inicial");
  const [excluirCasoModal, setExcluirCasoModal] = useState(false);

  const caso = item.caso;
  const numeroCaso = caso?.id ?? Number(casoId);
  const defaultValues = useMemo(() => getDefaultValues(item), [item]);

  const methods = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: defaultValues ?? fallbackDefaults,
  });

  const produtoWatch = methods.watch("produto");

  const updateCaso = useUpdateCaso();
  const clonarCaso = useClonarCaso();
  const deleteCaso = useDeleteCaso();
  const createAnotacao = useCreateAnotacao();
  const updateAnotacao = useUpdateAnotacao();
  const deleteAnotacao = useDeleteAnotacao();
  const createClienteCaso = useCreateClienteCaso();
  const deleteClienteCaso = useDeleteClienteCaso();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria", casoId] });
  };

  const handleSalvar = methods.handleSubmit(async (formData: EditFormData) => {
    try {
      const versaoProduto =
        formData.versao?.split("-")[1]?.trim() || formData.versao || "";
      const payload: UpdateCasoRequest = {
        DescricaoResumo: formData.DescricaoResumo,
        DescricaoCompleta: formData.DescricaoCompleta,
        InformacoesAdicionais: formData.InformacoesAdicionais ?? undefined,
        Prioridade: Number(formData.importancia),
        Categoria: Number(formData.categoria),
        Relator: Number(formData.relator),
        AtribuidoPara: Number(formData.devAtribuido),
        Modulo: formData.modulo || undefined,
        VersaoProduto: versaoProduto,
        Cronograma_id: Number(formData.projeto),
        Id_Origem: Number(formData.origem),
        status: Number(formData.status) || Number(caso?.status?.status_id ?? 1),
      };
      await updateCaso.mutateAsync({ id: casoId, data: payload });
      toast.success("Caso atualizado com sucesso.");
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atualizar caso.");
    }
  });

  const handleClonar = async () => {
    try {
      const res = await clonarCaso.mutateAsync(Number(casoId));
      toast.success(res.message ?? "Caso clonado com sucesso.");
      invalidate();
      if (res?.data?.registro) {
        router.push(`/casos/${res.data.registro}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao clonar caso.");
    }
  };

  const handleExcluirCaso = async () => {
    try {
      await deleteCaso.mutateAsync(Number(casoId));
      toast.success("Caso excluído com sucesso.");
      router.push("/casos");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir caso.");
    }
  };

  const handleCreateAnotacao = async (payload: {
    registro: number;
    anotacoes: string;
  }) => {
    await createAnotacao.mutateAsync(payload);
    toast.success("Anotação criada com sucesso.");
    invalidate();
  };

  const handleUpdateAnotacao = async (payload: {
    id: number;
    data: { anotacoes: string };
  }) => {
    await updateAnotacao.mutateAsync(payload);
    toast.success("Anotação atualizada com sucesso.");
    invalidate();
  };

  const handleDeleteAnotacao = async (sequencia: number) => {
    await deleteAnotacao.mutateAsync(sequencia);
    toast.success("Anotação excluída com sucesso.");
    invalidate();
  };

  const handleAddCliente = async (payload: {
    registro: number;
    cliente: number;
    incidente: number;
  }) => {
    await createClienteCaso.mutateAsync(payload);
    toast.success("Cliente vinculado com sucesso.");
    invalidate();
  };

  const handleDeleteCliente = async (sequencia: number) => {
    await deleteClienteCaso.mutateAsync(sequencia);
    toast.success("Cliente removido do caso.");
    invalidate();
  };

  const handleSaveProducao = async (payload: {
    TempoEstimado?: string | null;
    tamanho?: number | null;
    NaoPlanejado?: number | boolean;
  }) => {
    await updateCaso.mutateAsync({
      id: casoId,
      data: {
        TempoEstimado: payload.TempoEstimado ?? undefined,
        tamanho: payload.tamanho ?? undefined,
        NaoPlanejado: payload.NaoPlanejado ?? undefined,
      },
    });
    toast.success("Produção atualizada com sucesso.");
    invalidate();
  };

  const anotacoes = (caso?.anotacoes ??
    []) as ProjetoMemoriaItem["caso"]["anotacoes"];
  const clientes = (caso?.clientes ??
    []) as ProjetoMemoriaItem["caso"]["clientes"];
  const countAnotacoes = Array.isArray(anotacoes) ? anotacoes.length : 0;
  const countClientes = Array.isArray(clientes) ? clientes.length : 0;
  const countRelacoes = 0;

  const providerValue = useMemo(
    () => ({
      form: methods,
      importanceOptions,
      produto: produtoWatch,
      isDisabled: updateCaso.isPending,
      lazyLoadComboboxOptions: true as const,
      editCaseItem: item,
    }),
    [methods, produtoWatch, updateCaso.isPending, item],
  );

  return (
    <>
      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="flex flex-col flex-1 lg:min-h-0 lg:overflow-hidden"
      >
        <CasoEditHeader
          casoId={casoId}
          numeroCaso={caso?.id ?? Number(casoId)}
          countAnotacoes={countAnotacoes}
          countRelacoes={countRelacoes}
          countClientes={countClientes}
          tabValue={tabValue}
          onTabChange={setTabValue}
          onClonar={handleClonar}
          onExcluir={() => setExcluirCasoModal(true)}
          isClonando={clonarCaso.isPending}
          isExcluindo={deleteCaso.isPending}
        />

        <div className="mt-4 flex-1 flex flex-col min-h-0 overflow-auto">
          <CasoFormProvider value={providerValue}>
            <FormProvider {...methods}>
              <div className="flex-1 pb-12">
                <TabsContent
                  value="inicial"
                  className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col lg:flex-row gap-6 flex-1">
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                      <AbaInicial casoId={numeroCaso} />
                    </div>
                    <CasoEditColunaDireita casoId={numeroCaso} />
                  </div>
                </TabsContent>

                <TabsContent
                  value="anotacoes"
                  className="mt-0 flex flex-1 flex-col min-h-0 data-[state=inactive]:hidden"
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
                    <div className="flex min-h-0 flex-1 min-w-0 flex-col">
                      <AbaAnotacoes
                        casoId={numeroCaso}
                        anotacoes={anotacoes ?? []}
                        onCreate={handleCreateAnotacao}
                        onUpdate={handleUpdateAnotacao}
                        onDelete={handleDeleteAnotacao}
                        isCreating={createAnotacao.isPending}
                      />
                    </div>
                    <CasoEditColunaDireita casoId={numeroCaso} />
                  </div>
                </TabsContent>

                <TabsContent
                  value="relacoes"
                  className="mt-0 flex-1 data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col lg:flex-row gap-6 flex-1">
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                      <AbaRelacoes casoId={numeroCaso} />
                      <CasoEditCardClassificacao casoId={numeroCaso} />
                    </div>
                    <CasoEditColunaDireita casoId={numeroCaso} />
                  </div>
                </TabsContent>

                <TabsContent
                  value="clientes"
                  className="mt-0 flex-1 data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col lg:flex-row gap-6 flex-1">
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                      <AbaClientes
                        casoId={numeroCaso}
                        clientes={clientes ?? []}
                        onAdd={handleAddCliente}
                        onDelete={handleDeleteCliente}
                        isAdding={createClienteCaso.isPending}
                      />
                      <CasoEditCardClassificacao casoId={numeroCaso} />
                    </div>
                    <CasoEditColunaDireita casoId={numeroCaso} />
                  </div>
                </TabsContent>

                <TabsContent
                  value="producao"
                  className="mt-0 flex-1 data-[state=inactive]:hidden"
                >
                  <div className="flex flex-col lg:flex-row gap-6 flex-1">
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                      <AbaProducao
                        casoId={numeroCaso}
                        item={item}
                        onSaveProducao={handleSaveProducao}
                        isSaving={updateCaso.isPending}
                      />
                    </div>
                    <CasoEditColunaDireita casoId={numeroCaso} />
                  </div>
                </TabsContent>
              </div>

              <CasoEditRodapeAcoes
                casoId={numeroCaso}
                tempoStatus={
                  item?.caso?.tempos?.tempo_status ??
                  item?.caso?.status?.tempo_status
                }
                statusTempo={
                  item?.caso?.tempos?.status_tempo ??
                  item?.caso?.status?.status_tempo
                }
                onSalvar={handleSalvar}
                onCancelar={() => router.push("/casos")}
                onProducaoAlterada={invalidate}
                onRedirecionarParaAbaProducao={() => setTabValue("producao")}
                isLoading={updateCaso.isPending}
                disabled={updateCaso.isPending}
              />
            </FormProvider>
          </CasoFormProvider>
        </div>
      </Tabs>

      <ConfirmacaoModal
        open={excluirCasoModal}
        onOpenChange={setExcluirCasoModal}
        titulo="Excluir caso"
        descricao="Tem certeza que deseja excluir este caso? Esta ação não pode ser desfeita."
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirCaso}
        variant="danger"
        isLoading={deleteCaso.isPending}
      />
    </>
  );
}
