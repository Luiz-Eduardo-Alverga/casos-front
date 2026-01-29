"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { RotateCcw, Send, FileText, ListOrdered, Info, BriefcaseBusiness, AlertTriangle, Package, Tag, User, Rocket, FolderKanban, Activity } from "lucide-react";
import { ComboboxField } from "./combobox-field";
import { ComboboxOption } from "@/components/ui/combobox";
import { getUser } from "@/lib/auth";
import toast from "react-hot-toast";

interface ReportsFormProps {
  // Combobox options
  produtosOptions: ComboboxOption[];
  importanceOptions: ComboboxOption[];
  versoesOptions: ComboboxOption[];
  projetosOptions: ComboboxOption[];
  modulosOptions: ComboboxOption[];
  origensOptions: ComboboxOption[];
  categoriasOptions: ComboboxOption[];
  usuariosOptions: ComboboxOption[];
  // Loading states
  isProdutosLoading?: boolean;
  isVersoesLoading?: boolean;
  isProjetosLoading?: boolean;
  isModulosLoading?: boolean;
  isOrigensLoading?: boolean;
  isCategoriasLoading?: boolean;
  isUsuariosLoading?: boolean;
  onProdutosSearchChange?: (search: string) => void;
  onVersoesSearchChange?: (search: string) => void;
  onProjetosSearchChange?: (search: string) => void;
  onModulosSearchChange?: (search: string) => void;
  onOrigensSearchChange?: (search: string) => void;
  onCategoriasSearchChange?: (search: string) => void;
  onUsuariosSearchChange?: (search: string) => void;
  produto?: string;
  produtoSelecionado?: { setor: string } | null;
  onCreateCaso?: (data: any) => Promise<any>;
  isCreatingCaso?: boolean;
}

export function ReportsForm({
  produtosOptions,
  versoesOptions,
  projetosOptions,
  modulosOptions,
  origensOptions,
  categoriasOptions,
  usuariosOptions,
  importanceOptions,
  isProdutosLoading,
  isVersoesLoading,
  isProjetosLoading,
  isModulosLoading,
  isOrigensLoading,
  isCategoriasLoading,
  isUsuariosLoading,
  onProdutosSearchChange,
  onVersoesSearchChange,
  onProjetosSearchChange,
  onModulosSearchChange,
  onOrigensSearchChange,
  onCategoriasSearchChange,
  onUsuariosSearchChange,
  produto,
  produtoSelecionado,
  onCreateCaso,
  isCreatingCaso = false,
}: ReportsFormProps) {
  const { register, handleSubmit, reset } = useFormContext();
  
  const onSubmit = async (data: any) => {
    
    if (!onCreateCaso) return;
    
    try {
      // Extrair apenas a versão do campo versao (formato: "sequencia-versao-idx")
      const versaoProduto = data.versao ? data.versao.split("-")[1]?.trim() || data.versao : "";

      const user = getUser();
      // Mapear campos do front para a API
      const casoData = {
        Projeto: Number(data.produto),
        VersaoProduto: versaoProduto,
        Prioridade: Number(data.importancia),
        Cronograma_id: Number(data.projeto),
        Modulo: data.modulo || "",
        Id_Origem: data.origem || "",
        Categoria: Number(data.categoria),
        Relator: Number(data.relator),
        AtribuidoPara: Number(data.devAtribuido),
        QaId: Number(data.qaAtribuido),
        DescricaoResumo: data.DescricaoResumo || "",
        // Garante que a API receba as quebras de linha como o usuário digitou no textarea
        // (muitos backends/relatórios esperam CRLF)
        DescricaoCompleta: (data.DescricaoCompleta || "").replace(/\r?\n/g, "\r\n"),
        InformacoesAdicionais: data.InformacoesAdicionais || "",
        status: "1",
        Id_Usuario_AberturaCaso: Number(user?.id),
      };
      
      await onCreateCaso(casoData);
      // Resetar formulário após sucesso
      toast.success("Caso aberto com sucesso");
      reset();
    } catch (error) {
      console.error("Erro ao criar caso:", error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                Formulário para abrir caso
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Preencha os detalhes abaixo ou use o assistente IA acima
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Two-column Grid (ordem no DOM = ordem do TAB) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* produto */}
            <div className="space-y-4 md:col-start-1">
              <ComboboxField
                name="produto"
                label="Produto"
                icon={BriefcaseBusiness}
                options={produtosOptions}
                placeholder="Selecione o produto..."
                emptyText={isProdutosLoading ? "Carregando produtos..." : "Nenhum produto encontrado."}
                onSearchChange={onProdutosSearchChange}
                searchDebounceMs={450}
              />
            </div>

            {/* versão */}
            <div className="space-y-4 md:col-start-2">
              <ComboboxField
                name="versao"
                label="Versão do Produto"
                icon={Rocket}
                options={versoesOptions}
                placeholder={produto ? "Selecione a versão..." : "Selecione um produto primeiro."}
                emptyText={
                  !produto
                    ? "Selecione um produto primeiro."
                    : isVersoesLoading
                      ? "Carregando versões..."
                      : "Nenhuma versão encontrada."
                }
                onSearchChange={onVersoesSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* importância */}
            <div className="space-y-4 md:col-start-1">
              <ComboboxField
                name="importancia"
                label="Importância"
                icon={AlertTriangle}
                options={importanceOptions}
                placeholder="Selecione a importância..."
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* projeto */}
            <div className="space-y-4 md:col-start-2">
              <ComboboxField
                name="projeto"
                label="Projeto"
                icon={FolderKanban}
                options={projetosOptions}
                placeholder={produto ? "Selecione o projeto..." : "Selecione um produto primeiro."}
                emptyText={isProjetosLoading ? "Carregando projetos..." : "Nenhum projeto encontrado."}
                onSearchChange={onProjetosSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* modulo */}
            <div className="space-y-4 md:col-start-1">
              <ComboboxField
                name="modulo"
                label="Módulo"
                icon={Package}
                options={modulosOptions}
                placeholder={produto ? "Selecione o módulo..." : "Selecione um produto primeiro."}
                emptyText={isModulosLoading ? "Carregando módulos..." : "Nenhum módulo encontrado."}
                onSearchChange={onModulosSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* origem */}
            <div className="space-y-4 md:col-start-2">
              <ComboboxField
                name="origem"
                label="Origem"
                icon={Activity}
                options={origensOptions}
                placeholder="Selecione a origem..."
                emptyText={isOrigensLoading ? "Carregando origens..." : "Nenhuma origem encontrada."}
                onSearchChange={onOrigensSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* categoria */}
            <div className="space-y-4 md:col-start-1">
              <ComboboxField
                name="categoria"
                label="Categoria"
                icon={Tag}
                options={categoriasOptions}
                placeholder="Selecione a categoria..."
                emptyText={isCategoriasLoading ? "Carregando categorias..." : "Nenhuma categoria encontrada."}
                onSearchChange={onCategoriasSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* relator */}
            <div className="space-y-4 md:col-start-2">
              <ComboboxField
                name="relator"
                label="Relator"
                icon={User}
                options={usuariosOptions}
                placeholder="Selecione o relator..."
                emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                onSearchChange={onUsuariosSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* dev atribuído */}
            <div className="space-y-4 md:col-start-1">
              <ComboboxField
                name="devAtribuido"
                label="Dev atribuído"
                icon={User}
                options={usuariosOptions}
                placeholder="Selecione o dev atribuído..."
                emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                onSearchChange={onUsuariosSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>

            {/* qa atribuído */}
            <div className="space-y-4 md:col-start-2">
              <ComboboxField
                name="qaAtribuido"
                label="QA Atribuído"
                icon={User}
                options={usuariosOptions}
                placeholder="Selecione o QA atribuído..."
                emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                onSearchChange={onUsuariosSearchChange}
                searchDebounceMs={450}
                disabled={!produto || !produtoSelecionado}
              />
            </div>
          </div>

          {/* Full-width fields */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Resumo
              </Label>
              <Input
                id="summary"
                {...register("DescricaoResumo")}
                placeholder="Resumo breve do problema"
              />
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-primary" />
                Descrição Completa
              </Label>
              <Textarea
                id="description"
                placeholder="Descrição detalhada do bug ou problema"
                className="min-h-[100px]"
                {...register("DescricaoCompleta")}
              />
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Informações Adicionais
              </Label>
              <Textarea
                id="additionalInfo"
                placeholder="Qualquer outra informação relevante, capturas de tela, logs, etc."
                className="min-h-[80px]"
                {...register("InformacoesAdicionais")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar Formulário
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isCreatingCaso}
            >
              <Send className="h-4 w-4 mr-2" />
              {isCreatingCaso ? "Criando caso..." : "Abrir caso"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
