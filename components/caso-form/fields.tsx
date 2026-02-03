"use client";

import { ReactNode } from "react";
import { BriefcaseBusiness, AlertTriangle, Package, Tag, User, Rocket, FolderKanban, Activity, FileText, ListOrdered, Info, Sparkles } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCasoForm } from "./provider";
import { useFormContext } from "react-hook-form";

// Campo Produto
export function CasoFormProduto() {
  const { produtosOptions, isProdutosLoading, onProdutosSearchChange, isDisabled } = useCasoForm();
  
  return (
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
        disabled={isDisabled}
      />
    </div>
  );
}

// Campo Versão
export function CasoFormVersao() {
  const { versoesOptions, isVersoesLoading, onVersoesSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
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
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Importância
export function CasoFormImportancia() {
  const { importanceOptions, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-4 md:col-start-1">
      <ComboboxField
        name="importancia"
        label="Importância"
        icon={AlertTriangle}
        options={importanceOptions}
        placeholder="Selecione a importância..."
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Projeto
export function CasoFormProjeto() {
  const { projetosOptions, isProjetosLoading, onProjetosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
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
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Módulo
export function CasoFormModulo() {
  const { modulosOptions, isModulosLoading, onModulosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
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
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Origem
export function CasoFormOrigem() {
  const { origensOptions, isOrigensLoading, onOrigensSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
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
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Categoria
export function CasoFormCategoria() {
  const { categoriasOptions, isCategoriasLoading, onCategoriasSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
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
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Relator
export function CasoFormRelator() {
  const { relatoresOptions, isUsuariosLoading, onUsuariosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-4 md:col-start-2">
      <ComboboxField
        name="relator"
        label="Relator"
        icon={User}
        options={relatoresOptions}
        placeholder="Selecione o relator..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        onSearchChange={onUsuariosSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Dev Atribuído
export function CasoFormDevAtribuido() {
  const { devOptions, isUsuariosLoading, onUsuariosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-4 md:col-start-1">
      <ComboboxField
        name="devAtribuido"
        label="Dev atribuído"
        icon={User}
        options={devOptions}
        placeholder="Selecione o dev atribuído..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        onSearchChange={onUsuariosSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo QA Atribuído
export function CasoFormQaAtribuido() {
  const { qasOptions, isUsuariosLoading, onUsuariosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-4 md:col-start-2">
      <ComboboxField
        name="qaAtribuido"
        label="QA Atribuído"
        icon={User}
        options={qasOptions}
        placeholder="Selecione o QA atribuído..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        onSearchChange={onUsuariosSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled || !produto || !produtoSelecionado}
      />
    </div>
  );
}

// Campo Descrição Resumo
interface CasoFormDescricaoResumoProps {
  onOpenAssistant?: () => void;
}

export function CasoFormDescricaoResumo({ onOpenAssistant }: CasoFormDescricaoResumoProps) {
  const { isDisabled } = useCasoForm();
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="summary" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Resumo
        </Label>
        {onOpenAssistant && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenAssistant}
            className="h-8 text-xs"
            disabled={isDisabled}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Assistente IA
          </Button>
        )}
      </div>
      <Input
        id="summary"
        {...register("DescricaoResumo")}
        placeholder="Resumo breve do problema"
        disabled={isDisabled}
      />
      {errors.DescricaoResumo && (
        <p className="text-sm text-destructive">{errors.DescricaoResumo.message as string}</p>
      )}
    </div>
  );
}

// Campo Descrição Completa
export function CasoFormDescricaoCompleta() {
  const { isDisabled } = useCasoForm();
  const { register, formState: { errors } } = useFormContext();
  
  return (
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
        disabled={isDisabled}
      />
      {errors.DescricaoCompleta && (
        <p className="text-sm text-destructive">{errors.DescricaoCompleta.message as string}</p>
      )}
    </div>
  );
}

// Campo Informações Adicionais
export function CasoFormInformacoesAdicionais() {
  const { isDisabled } = useCasoForm();
  const { register } = useFormContext();
  
  return (
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
        disabled={isDisabled}
      />
    </div>
  );
}

// Grid container para campos em duas colunas
export function CasoFormFieldsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  );
}

// Container para campos full-width
export function CasoFormFieldsFullWidth({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
}
