"use client";

import { ReactNode } from "react";
import { BriefcaseBusiness, AlertTriangle, Package, Tag, User, Rocket, FolderKanban, Activity, FileText, Bug } from "lucide-react";
import { ComboboxField } from "@/components/reports-form/combobox-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCasoForm } from "./provider";
import { useFormContext } from "react-hook-form";

// Campo Produto
export function CasoFormProduto() {
  const { produtosOptions, isProdutosLoading, onProdutosSearchChange, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
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
        required
      />
    </div>
  );
}

// Campo Versão
export function CasoFormVersao() {
  const { versoesOptions, isVersoesLoading, onVersoesSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="versao"
        label="Versão do Produto"
        icon={Rocket}
        options={versoesOptions}
        placeholder={produto ? "Selecione a versão..." : "Selecione o produto primeiro."}
        emptyText={
          !produto
            ? "Selecione o produto primeiro."
            : isVersoesLoading
              ? "Carregando versões..."
              : "Nenhuma versão encontrada."
        }
        onSearchChange={onVersoesSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled || !produto || !produtoSelecionado}
        required
      />
    </div>
  );
}

// Campo Importância
export function CasoFormImportancia() {
  const { importanceOptions, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="importancia"
        label="Importância"
        icon={AlertTriangle}
        options={importanceOptions}
        placeholder="Selecione a importância..."
        disabled={isDisabled}
        required
      />
    </div>
  );
}

// Campo Projeto
export function CasoFormProjeto() {
  const { projetosOptions, isProjetosLoading, onProjetosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="projeto"
        label="Projeto"
        icon={FolderKanban}
        options={projetosOptions}
        placeholder={produto ? "Selecione o projeto..." : "Selecione o produto primeiro."}
        emptyText={isProjetosLoading ? "Carregando projetos..." : "Nenhum projeto encontrado."}
        onSearchChange={onProjetosSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled || !produto || !produtoSelecionado}
        required
      />
    </div>
  );
}

// Campo Módulo
export function CasoFormModulo() {
  const { modulosOptions, isModulosLoading, onModulosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="modulo"
        label="Módulo"
        icon={Package}
        options={modulosOptions}
        placeholder={produto ? "Selecione o módulo..." : "Selecione o produto primeiro."}
        emptyText={isModulosLoading ? "Carregando módulos..." : "Nenhum módulo encontrado."}
        onSearchChange={onModulosSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled || !produto || !produtoSelecionado}
        required
      />
    </div>
  );
}

// Campo Origem
export function CasoFormOrigem() {
  const { origensOptions, isOrigensLoading, onOrigensSearchChange, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="origem"
        label="Origem"
        icon={Activity}
        options={origensOptions}
        placeholder="Selecione a origem..."
        emptyText={isOrigensLoading ? "Carregando origens..." : "Nenhuma origem encontrada."}
        onSearchChange={onOrigensSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled}
        required
      />
    </div>
  );
}

// Campo Categoria
export function CasoFormCategoria() {
  const { categoriasOptions, isCategoriasLoading, onCategoriasSearchChange, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="categoria"
        label="Categoria"
        icon={Tag}
        options={categoriasOptions}
        placeholder="Selecione a categoria..."
        emptyText={isCategoriasLoading ? "Carregando categorias..." : "Nenhuma categoria encontrada."}
        onSearchChange={onCategoriasSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled}
        required
      />
    </div>
  );
}

// Campo Relator
export function CasoFormRelator() {
  const { relatoresOptions, isUsuariosLoading, onUsuariosSearchChange, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="relator"
        label="Relator"
        icon={User}
        options={relatoresOptions}
        placeholder="Selecione o relator..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        onSearchChange={onUsuariosSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled}
        required
      />
    </div>
  );
}

// Campo Dev Atribuído
export function CasoFormDevAtribuido() {
  const { devOptions, isUsuariosLoading, onUsuariosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
      <ComboboxField
        name="devAtribuido"
        label="Dev Atribuído"
        icon={User}
        options={devOptions}
        placeholder="Selecione o dev atribuído..."
        emptyText={isUsuariosLoading ? "Carregando usuários..." : "Nenhum usuário encontrado."}
        onSearchChange={onUsuariosSearchChange}
        searchDebounceMs={450}
        disabled={isDisabled || !produto || !produtoSelecionado}
        required
      />
    </div>
  );
}

// Campo QA Atribuído
export function CasoFormQaAtribuido() {
  const { qasOptions, isUsuariosLoading, onUsuariosSearchChange, produto, produtoSelecionado, isDisabled } = useCasoForm();
  
  return (
    <div className="space-y-2">
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
      <div className="flex justify-between items-center">
        <Label htmlFor="summary" className="text-sm font-medium text-text-label">
          Resumo (Título) <span className="text-text-error">*</span>
        </Label>

        {errors.DescricaoResumo && (
          <p className="text-sm text-destructive">{errors.DescricaoResumo.message as string}</p>
        )}
      </div>
      <Input
        id="summary"
        {...register("DescricaoResumo")}
        placeholder="Resumo breve do caso"
        disabled={isDisabled}
        className="h-[42px] rounded-lg border-border-input px-[17px] py-3"
      />
      <p className="text-xs text-text-secondary">O resumo deve ser breve e descritivo</p>
      
    </div>
  );
}

// Campo Descrição Completa
export function CasoFormDescricaoCompleta() {
  const { isDisabled } = useCasoForm();
  const { register, formState: { errors } } = useFormContext();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="description" className="text-sm font-medium text-text-label">
          Descrição Completa <span className="text-text-error">*</span>
        </Label>

        {errors.DescricaoCompleta && (
          <p className="text-sm text-destructive">{errors.DescricaoCompleta.message as string}</p>
        )}
      </div>
      <Textarea
        id="description"
        placeholder="Descreva detalhadamente o caso, incluindo contexto, passos para reproduzir e comportamento esperado..."
        className="min-h-[158px] resize-none rounded-lg border-border-input px-[17px] py-[13px]"
        {...register("DescricaoCompleta")}
        disabled={isDisabled}
      />
    </div>
  );
}

// Campo Informações Adicionais
export function CasoFormInformacoesAdicionais() {
  const { isDisabled } = useCasoForm();
  const { register } = useFormContext();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="additionalInfo" className="text-sm font-medium text-text-label">
        Informações Adicionais
      </Label>
      <Textarea
        id="additionalInfo"
        placeholder="Adicione qualquer informação complementar, links, evidências ou observações relevantes..."
        className="min-h-[88px] resize-none rounded-lg border-border-input px-[17px] py-[13px]"
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
