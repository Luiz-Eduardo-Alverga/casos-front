"use client";

import { useEffect, useMemo, useState } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { useAssistant } from "@/hooks/use-assistant";
import {  importanceOptions } from "@/mocks/teste";
import { clearAuthData, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useProdutos } from "@/hooks/use-produtos";
import { useVersoes } from "@/hooks/use-versoes";
import { useProjetos } from "@/hooks/use-projetos";
import { useModulos } from "@/hooks/use-modulos";
import { useOrigens } from "@/hooks/use-origens";
import { useCategorias } from "@/hooks/use-categorias";
import { useUsuarios } from "@/hooks/use-usuarios";
import { useCreateCaso } from "@/hooks/use-create-caso";
import { ReportsHeader } from "@/components/reports-header";
import { ReportsAssistant } from "@/components/reports-assistant";
import { ReportsForm } from "@/components/reports-form";
import type { Produto } from "@/services/auxiliar/produtos";
import type { Usuario } from "@/services/auxiliar/usuarios";
import type { Projeto } from "@/services/auxiliar/projetos";
import toast from "react-hot-toast";


const assistantSFormSchema = z.object({
  description: z.string(),
});

const reportsFormSchema = z.object({
  produto: z.string({ required_error: "Produto é obrigatório" }).min(1, "Produto é obrigatório"),
  importancia: z.string({ required_error: "Importância é obrigatória" }).min(1, "Importância é obrigatória"),
  modulo: z.string({ required_error: "Módulo é obrigatório" }),
  categoria: z.string({ required_error: "Categoria é obrigatória" }).min(1, "Categoria é obrigatória"),
  devAtribuido: z.string({ required_error: "Dev atribuído é obrigatório" }).min(1, "Dev atribuído é obrigatório"),
  versao: z.string({ required_error: "Versão é obrigatória" }).min(1, "Versão é obrigatória"),
  projeto: z.string({ required_error: "Projeto é obrigatório" }).min(1, "Projeto é obrigatório"),
  origem: z.string({ required_error: "Origem é obrigatória" }).min(1, "Origem é obrigatória"),
  relator: z.string({ required_error: "Relator é obrigatório" }).min(1, "Relator é obrigatório"),
  qaAtribuido: z.string({ required_error: "QA atribuído é obrigatório" }),
  DescricaoResumo: z.string({ required_error: "Resumo é obrigatório" }).min(1, "Resumo é obrigatório"),
  DescricaoCompleta: z.string({ required_error: "Descrição completa é obrigatória" }).min(1, "Descrição completa é obrigatória"),
  InformacoesAdicionais: z.string().optional(),
});

type ReportsFormData = z.infer<typeof reportsFormSchema>;

type AssistantFormData = z.infer<typeof assistantSFormSchema>;

export  function Reports() {
  const router = useRouter();

  const { register, handleSubmit, formState: { isSubmitting: isAssistantSubmitting }, reset} = useForm<AssistantFormData>({
    resolver: zodResolver(assistantSFormSchema),
  });

  // Obter usuário logado para preencher relator por padrão
  const user = getUser();
  
  const methods = useForm<ReportsFormData>({
    resolver: zodResolver(reportsFormSchema),
    defaultValues: {
      produto: "",
      importancia: "3",
      modulo: "",
      categoria: "4",
      devAtribuido: "",
      versao: "",
      projeto: "",
      origem: "4",
      relator: user ? String(user.id) : "",
      qaAtribuido: "",
      DescricaoResumo: "",
      DescricaoCompleta: "",
      InformacoesAdicionais: "",
    },
  });
  
  const produto = methods.watch("produto");
  const devAtribuido = methods.watch("devAtribuido");
  const qaAtribuido = methods.watch("qaAtribuido");
  const relator = methods.watch("relator");

  const { mutateAsync: assistantMutateAsync } = useAssistant();
  const { mutateAsync: createCasoAsync, isPending: isCreatingCaso } = useCreateCaso();

  function handleLogout() {
    clearAuthData();
    router.push("/login");
  }

  async function onAssistantSubmit(data: AssistantFormData) {
    try {
      const response =await assistantMutateAsync({ description: data.description });

      if (response.data.title && response.data.description && response.data.additionalInformation) {
        methods.setValue("DescricaoResumo", response.data.title);
        methods.setValue("DescricaoCompleta", response.data.description);
        methods.setValue("InformacoesAdicionais", response.data.additionalInformation);
      }

      reset();

      toast.success("Título, descrição e informações adicionais preenchidos com sucesso");
    } catch (error) {
      console.error(error);
    }
  }

  const [isRecording, setIsRecording] = useState(false);
  
  // Search states (para debounce - só faz requisição quando usuário digitar)
  const [produtosSearch, setProdutosSearch] = useState<string>("");
  const [versoesSearch, setVersoesSearch] = useState<string>("");
  const [projetosSearch, setProjetosSearch] = useState<string>("");
  const [modulosSearch, setModulosSearch] = useState<string>("");
  const [origensSearch, setOrigensSearch] = useState<string>("");
  const [categoriasSearch, setCategoriasSearch] = useState<string>("");
  const [usuariosSearch, setUsuariosSearch] = useState<string>("");
  
  // Estado para manter os dados completos do produto selecionado
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  
  // Estados para manter os dados completos dos usuários selecionados
  const [devSelecionado, setDevSelecionado] = useState<Usuario | null>(null);
  const [qaSelecionado, setQaSelecionado] = useState<Usuario | null>(null);
  const [relatorSelecionado, setRelatorSelecionado] = useState<Usuario | null>(null);
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would trigger audio recording
    if (!isRecording) {
      setTimeout(() => setIsRecording(false), 3000); // Auto-stop after 3 seconds for demo
    }
  };
  
  // Produtos / Versões (API)
  // Só faz requisição quando houver busca (após usuário digitar)
  const { data: produtos, isLoading: isProdutosLoading } = useProdutos({ 
    search: produtosSearch.trim() || undefined 
  });

  const { data: versoes, isLoading: isVersoesLoading } = useVersoes({
    produto_id: produto,
    search: versoesSearch.trim() || undefined,
  });
  
  const { data: projetos, isLoading: isProjetosLoading } = useProjetos({
    setor_projeto: produtoSelecionado?.setor,
    search: projetosSearch.trim() || undefined,
  });
  
  const { data: modulos, isLoading: isModulosLoading } = useModulos({
    produto_id: produto,
  });
  
  const { data: origens, isLoading: isOrigensLoading } = useOrigens();
  
  const { data: categorias, isLoading: isCategoriasLoading } = useCategorias();
  
  const { data: usuarios, isLoading: isUsuariosLoading } = useUsuarios({
    search: usuariosSearch.trim() || undefined,
  });

  const produtosOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    
    // Adiciona produtos da API
    if (produtos && Array.isArray(produtos)) {
      produtos.forEach((p) => {
        options.push({
          value: String(p.id),
          label: `${p.nome_projeto} - ${p.setor}`,
        });
      });
    }
    
    // Se há um produto selecionado e ele não está nas opções, adiciona ele no início
    if (produto && produtoSelecionado) {
      const produtoValue = String(produtoSelecionado.id);
      const produtoLabel = `${produtoSelecionado.nome_projeto} - ${produtoSelecionado.setor}`;
      
      // Verifica se já não está nas opções
      const jaExiste = options.some(opt => opt.value === produtoValue);
      if (!jaExiste) {
        options.unshift({
          value: produtoValue,
          label: produtoLabel,
        });
      }
    }
    
    return options;
  }, [produtos, produto, produtoSelecionado]);

  const versoesOptions = useMemo(() => {
    // garantir um `value` único por opção (o Combobox usa `value` como `key`).
    return (versoes ?? []).map((v, idx) => ({
      value: `${v.sequencia ?? ""}-${v.versao ?? ""}-${idx}`,
      label: v.versao,
    }));
  }, [versoes]);

  const projetosOptions = useMemo(() => {
    if (!projetos || !Array.isArray(projetos)) return [];
    
    // Data atual
    const hoje = new Date();
    const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Filtrar projetos: apenas do mês atual e próximos meses
    // Um projeto é válido se data_final >= primeiro dia do mês atual
    const projetosFiltrados = projetos.filter((p: Projeto) => {
      if (!p.data_final) return false;
      const dataFinal = new Date(p.data_final);
      return dataFinal >= primeiroDiaMesAtual;
    });
    
    return projetosFiltrados.map((p) => ({
      value: String(p.id),
      label: p.nome_projeto,
    }));
  }, [projetos]);
  
  // Encontrar projeto do mês atual e definir como padrão (apenas quando produto está selecionado)
  useEffect(() => {
    if (produto && produtoSelecionado && projetos && Array.isArray(projetos) && projetosOptions.length > 0) {
      const projetoAtual = methods.getValues("projeto");
      // Só definir se ainda não houver projeto selecionado
      if (!projetoAtual || projetoAtual === "") {
        const hoje = new Date();
        const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        // Encontrar projeto que está no mês atual
        const projetoMesAtual = projetos.find((p: Projeto) => {
          if (!p.data_inicial || !p.data_final) return false;
          const dataInicial = new Date(p.data_inicial);
          const dataFinal = new Date(p.data_final);
          // Projeto está no mês atual se data_inicial <= último dia do mês atual E data_final >= primeiro dia do mês atual
          return dataInicial <= ultimoDiaMesAtual && dataFinal >= primeiroDiaMesAtual;
        });
        
        if (projetoMesAtual) {
          methods.setValue("projeto", String(projetoMesAtual.id));
        } else {
          // Se não encontrar projeto do mês atual, pegar o primeiro projeto válido (mais próximo)
          const primeiroProjeto = projetosOptions[0];
          if (primeiroProjeto) {
            methods.setValue("projeto", primeiroProjeto.value);
          }
        }
      }
    }
  }, [produto, produtoSelecionado, projetos, projetosOptions, methods]);

  const modulosOptions = useMemo(() => {
    if (!modulos || !Array.isArray(modulos)) return [];
    // Retorna array de strings, então mapeamos para o formato do Combobox
    return modulos.map((modulo) => ({
      value: modulo,
      label: modulo,
    }));
  }, [modulos]);

  const origensOptions = useMemo(() => {
    if (!origens || !Array.isArray(origens)) return [];
    return origens.map((origem) => ({
      value: origem.id,
      label: origem.nome,
    }));
  }, [origens]);

  const categoriasOptions = useMemo(() => {
    if (!categorias || !Array.isArray(categorias)) return [];
    return categorias.map((categoria) => ({
      value: categoria.id,
      label: categoria.tipo_categoria,
    }));
  }, [categorias]);

  const relatoresOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    
    // Adiciona usuário logado (relator padrão)
    if (user) {
      options.push({
        value: user.id.toString(),
        label: user.nome,
      });
    }
    
    // Adiciona usuários da API
    if (usuarios && Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        options.push({
          value: u.id,
          label: u.nome_suporte,
        });
      });
    }
    
    // Adiciona relator selecionado se não estiver nas opções
    if (relator && relatorSelecionado) {
      const relatorValue = relatorSelecionado.id;
      const relatorLabel = relatorSelecionado.nome_suporte;
      const jaExiste = options.some(opt => opt.value === relatorValue);
      if (!jaExiste) {
        options.unshift({
          value: relatorValue,
          label: relatorLabel,
        });
      }
    }
    
    return options;
  }, [usuarios, relator, relatorSelecionado, user]);

  const devOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    
    // Adiciona usuários da API
    if (usuarios && Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        options.push({
          value: u.id,
          label: u.nome_suporte,
        });
      });
    }
    
    // Adiciona dev selecionado se não estiver nas opções
    if (devAtribuido && devSelecionado) {
      const devValue = devSelecionado.id;
      const devLabel = devSelecionado.nome_suporte;
      const jaExiste = options.some(opt => opt.value === devValue);
      if (!jaExiste) {
        options.unshift({
          value: devValue,
          label: devLabel,
        });
      }
    }
    
    return options;
  }, [usuarios, devAtribuido, devSelecionado]);

  const qasOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    
    // Adiciona usuários da API
    if (usuarios && Array.isArray(usuarios)) {
      usuarios.forEach((u) => {
        options.push({
          value: u.id,
          label: u.nome_suporte,
        });
      });
    }
    
    // Adiciona QA selecionado se não estiver nas opções
    if (qaAtribuido && qaSelecionado) {
      const qaValue = qaSelecionado.id;
      const qaLabel = qaSelecionado.nome_suporte;
      const jaExiste = options.some(opt => opt.value === qaValue);
      if (!jaExiste) {
        options.unshift({
          value: qaValue,
          label: qaLabel,
        });
      }
    }
    
    return options;
  }, [usuarios, qaAtribuido, qaSelecionado]);

  // Quando o produto é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (produto && produtos && Array.isArray(produtos)) {
      const produtoEncontrado = produtos.find(p => String(p.id) === produto);
      if (produtoEncontrado) {
        setProdutoSelecionado(produtoEncontrado);
      }
    } else if (!produto) {
      setProdutoSelecionado(null);
    }
  }, [produto, produtos]);

  // Quando dev é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (devAtribuido && usuarios && Array.isArray(usuarios)) {
      const devEncontrado = usuarios.find(u => u.id === devAtribuido);
      if (devEncontrado) {
        setDevSelecionado(devEncontrado);
      }
    } else if (!devAtribuido) {
      setDevSelecionado(null);
    }
  }, [devAtribuido, usuarios]);

  // Quando QA é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (qaAtribuido && usuarios && Array.isArray(usuarios)) {
      const qaEncontrado = usuarios.find(u => u.id === qaAtribuido);
      if (qaEncontrado) {
        setQaSelecionado(qaEncontrado);
      }
    } else if (!qaAtribuido) {
      setQaSelecionado(null);
    }
  }, [qaAtribuido, usuarios]);

  // Quando relator é selecionado, buscar e salvar os dados completos
  useEffect(() => {
    if (relator && usuarios && Array.isArray(usuarios)) {
      const relatorEncontrado = usuarios.find(u => u.id === relator);
      if (relatorEncontrado) {
        setRelatorSelecionado(relatorEncontrado);
      }
    } else if (!relator) {
      setRelatorSelecionado(null);
    }
  }, [relator, usuarios]);

  // Ao trocar produto, limpar versão selecionada, busca de versões, projeto e módulo selecionados
  useEffect(() => {
    if (produto) {
      methods.setValue("versao", "");
      methods.setValue("projeto", "");
      methods.setValue("modulo", "");
      setVersoesSearch("");
      setProjetosSearch("");
      setModulosSearch("");
      setCategoriasSearch("");
      setUsuariosSearch("");
    }
  }, [produto, methods]);
  

  return (
    <div className="min-h-screen bg-background">
      <ReportsHeader onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        <ReportsAssistant
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={onAssistantSubmit}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          isAssistantSubmitting={isAssistantSubmitting}
        />

        <FormProvider {...methods}>
          <ReportsForm
            produtosOptions={produtosOptions}
            isCreatingCaso={isCreatingCaso}
            onCreateCaso={createCasoAsync}
            versoesOptions={versoesOptions}
            projetosOptions={projetosOptions}
            modulosOptions={modulosOptions}
            origensOptions={origensOptions}
            categoriasOptions={categoriasOptions}
            relatoresOptions={relatoresOptions}
            devOptions={devOptions}
            qasOptions={qasOptions}
            isProdutosLoading={isProdutosLoading}
            importanceOptions={importanceOptions}
            isVersoesLoading={isVersoesLoading}
            isProjetosLoading={isProjetosLoading}
            isModulosLoading={isModulosLoading}
            isOrigensLoading={isOrigensLoading}
            isCategoriasLoading={isCategoriasLoading}
            isUsuariosLoading={isUsuariosLoading}
            onProdutosSearchChange={setProdutosSearch}
            onVersoesSearchChange={setVersoesSearch}
            onProjetosSearchChange={setProjetosSearch}
            onModulosSearchChange={setModulosSearch}
            onOrigensSearchChange={setOrigensSearch}
            onCategoriasSearchChange={setCategoriasSearch}
            onUsuariosSearchChange={setUsuariosSearch}
            produtoSelecionado={produtoSelecionado}
            produto={produto}
            isSubmitting={methods.formState.isSubmitting}
          />
        </FormProvider>
      </div>
    </div>
  );
}
