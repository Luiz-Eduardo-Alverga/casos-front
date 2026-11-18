"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { useComunicadoFiltros } from "@/hooks/comunicados/use-comunicado-filtros";
import { useCriarComunicado } from "@/hooks/comunicados/use-criar-comunicado";
import { useTodosUsuariosComunicado } from "@/hooks/comunicados/use-todos-usuarios-comunicado";
import { useUsuariosComunicado } from "@/hooks/comunicados/use-usuarios-comunicado";
import { ConfirmarDescarte } from "./confirmar-descarte";
import { ConteudoCard } from "./conteudo-card";
import { DestinatariosCard } from "./destinatarios-card";
import { ListaDestinatarios } from "./lista-destinatarios";
import {
  FILTROS_VAZIOS,
  type ModoDestinatarios,
} from "./novo-aviso.types";
import {
  NOVO_AVISO_DEFAULTS,
  novoAvisoSchema,
  type NovoAvisoFormValues,
} from "./schema";
import {
  idsSelecionados,
  montarFiltrosPayload,
  montarListaDestinatarios,
  montarPayload,
  temFiltro,
} from "./utils";

export function NovoAviso() {
  const router = useRouter();
  const form = useForm<NovoAvisoFormValues>({
    resolver: zodResolver(novoAvisoSchema),
    defaultValues: NOVO_AVISO_DEFAULTS,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { watch, setValue, handleSubmit } = form;

  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [busca, setBusca] = useState("");

  const modo = watch("modo");
  const filtros = watch("filtros");
  const extras = watch("extras");
  const excluidos = watch("excluidos");

  const filtrosQuery = useComunicadoFiltros();
  const opcoes = filtrosQuery.data;

  const todosFiltros = useMemo(
    () =>
      opcoes ? montarFiltrosPayload("todos", FILTROS_VAZIOS, opcoes) : undefined,
    [opcoes],
  );
  const todosQuery = useTodosUsuariosComunicado(todosFiltros);

  const filtrosKey = JSON.stringify(filtros);
  const filtrosAtivos = useMemo(
    () =>
      modo === "filtrar" && opcoes && temFiltro(filtros)
        ? montarFiltrosPayload("filtrar", filtros, opcoes)
        : null,
    // filtrosKey cobre o conteúdo de `filtros` (o objeto muda de referência a cada render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modo, opcoes, filtrosKey],
  );
  const filtradosQuery = useUsuariosComunicado(filtrosAtivos);

  const base = useMemo(() => {
    if (modo === "todos") return todosQuery.data ?? [];
    return filtrosAtivos ? (filtradosQuery.data ?? []) : [];
  }, [modo, todosQuery.data, filtrosAtivos, filtradosQuery.data]);

  const lista = useMemo(
    () => montarListaDestinatarios(base, extras),
    [base, extras],
  );
  const selecionados = useMemo(
    () => idsSelecionados(lista, excluidos),
    [lista, excluidos],
  );

  const criar = useCriarComunicado();
  const enviando = criar.isPending;

  const listaCarregando =
    filtrosQuery.isLoading ||
    (modo === "todos" ? todosQuery.isLoading : filtradosQuery.isFetching);
  const listaComErro =
    filtrosQuery.isError ||
    (modo === "todos" ? todosQuery.isError : filtradosQuery.isError);

  const tentarDeNovo = useCallback(() => {
    if (filtrosQuery.isError) void filtrosQuery.refetch();
    if (todosQuery.isError) void todosQuery.refetch();
    if (filtradosQuery.isError) void filtradosQuery.refetch();
  }, [filtrosQuery, todosQuery, filtradosQuery]);

  const handleModoChange = (novo: ModoDestinatarios) => {
    if (novo === modo) return;
    setValue("modo", novo, { shouldDirty: true });
    setValue("excluidos", []);
    setBusca("");
  };

  const handleToggle = (registro: number, marcado: boolean) => {
    if (!marcado && extras.some((u) => u.registro === registro)) {
      // decisão #6: desmarcar um usuário adicionado o tira da lista
      setValue(
        "extras",
        extras.filter((u) => u.registro !== registro),
        { shouldDirty: true },
      );
      return;
    }
    const sem = excluidos.filter((id) => id !== registro);
    setValue("excluidos", marcado ? sem : [...sem, registro], {
      shouldDirty: true,
    });
  };

  const handleToggleVarios = (registros: number[], marcado: boolean) => {
    const alvo = new Set(registros);
    const sem = excluidos.filter((id) => !alvo.has(id));
    setValue("excluidos", marcado ? sem : [...sem, ...registros], {
      shouldDirty: true,
    });
  };

  const handleLimparFiltros = () => {
    setValue("filtros", FILTROS_VAZIOS, { shouldDirty: true });
    setValue("excluidos", []);
  };

  const enviar = handleSubmit(async (values) => {
    if (selecionados.length === 0) return;
    if (!opcoes) {
      toast.error("Os filtros de destinatários não carregaram. Tente de novo.");
      return;
    }
    try {
      const payload = montarPayload({
        titulo: values.titulo,
        descricao: values.descricao,
        auto: values.auto,
        filtros: montarFiltrosPayload(values.modo, values.filtros, opcoes),
        suporteIds: selecionados,
      });
      const res = await criar.mutateAsync(payload);
      const total = res.data?.total_destinatarios ?? selecionados.length;
      toast.success(
        total === 1
          ? "Aviso enviado para 1 destinatário."
          : `Aviso enviado para ${total} destinatários.`,
      );
      router.push("/avisos");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar o aviso.",
      );
    }
  });

  const handleEnviar = () => {
    setTentouEnviar(true);
    void enviar();
  };

  const handleVoltar = () => {
    const v = form.getValues();
    const preenchido =
      v.titulo.trim() !== "" ||
      v.descricao.trim() !== "" ||
      temFiltro(v.filtros) ||
      v.extras.length > 0;
    if (preenchido) setConfirmarDescarte(true);
    else router.push("/avisos");
  };

  const erroDestinatarios =
    tentouEnviar && selecionados.length === 0
      ? "Selecione pelo menos um destinatário."
      : null;

  const vazioSemBase =
    modo === "filtrar" && !temFiltro(filtros) && extras.length === 0
      ? "Escolha um filtro ou adicione usuários específicos acima."
      : null;

  return (
    <ListagemPageLayout
      title="Novo aviso"
      subtitle="Escreva o comunicado e escolha quem vai recebê-lo."
      className="lg:min-h-0 lg:overflow-auto"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleVoltar}
            disabled={enviando}
            className="w-full bg-card sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
          <Button
            type="button"
            onClick={handleEnviar}
            disabled={enviando}
            className="w-full sm:w-auto"
          >
            <Send className="size-4" />
            {enviando ? "Enviando..." : "Enviar aviso"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 lg:min-h-[560px] lg:flex-1 lg:flex-row">
        <ConteudoCard form={form} disabled={enviando} />
        <DestinatariosCard
          modo={modo}
          onModoChange={handleModoChange}
          totalEmpresa={todosQuery.data ? todosQuery.data.length : null}
          selecionados={selecionados.length}
          mostrarLimparFiltros={modo === "filtrar" && temFiltro(filtros)}
          onLimparFiltros={handleLimparFiltros}
          disabled={enviando}
          erro={erroDestinatarios}
        >
          <ListaDestinatarios
            lista={lista}
            excluidos={excluidos}
            busca={busca}
            onBuscaChange={setBusca}
            onToggle={handleToggle}
            onToggleVarios={handleToggleVarios}
            isLoading={listaCarregando}
            isError={listaComErro}
            onRetry={tentarDeNovo}
            vazioSemBase={vazioSemBase}
            invalid={!!erroDestinatarios}
          />
        </DestinatariosCard>
      </div>

      <ConfirmarDescarte
        open={confirmarDescarte}
        onOpenChange={setConfirmarDescarte}
        onConfirm={() => router.push("/avisos")}
      />
    </ListagemPageLayout>
  );
}
