"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useSgpTipos } from "@/hooks/catalogos/use-sgp-tipos";
import { useUsuariosProjetos } from "@/hooks/catalogos/use-usuarios";
import { useSgpStakesTodos } from "@/hooks/projetos/use-sgp-stakes-todos";
import { useSgpUsuariosByProjetoInfinite } from "@/hooks/projetos/use-sgp-usuarios-by-projeto";
import { useDeleteSgpStake } from "@/hooks/projetos/use-delete-sgp-stake";
import { useDeleteSgpUsuario } from "@/hooks/projetos/use-delete-sgp-usuario";
import {
  useSalvarStakesEmLote,
  type ItemLoteStake,
} from "@/hooks/projetos/use-salvar-stakes-em-lote";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import type { SgpUsuarioProjetoItem } from "@/interfaces/sgp-usuario-projeto";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";
import { useAlteracoesPendentes } from "@/components/projetos/edicao/shared/alteracoes-pendentes";
import {
  buildSgpTiposMap,
  getUsuarioNomeExibicao,
} from "@/components/projetos/edicao/stakes/utils";
import {
  linhaToCreatePayload,
  linhaToUpdatePayload,
} from "@/components/projetos/edicao/stakes/stake-form-utils";
import {
  mesclarComServidor,
  novaLinha,
  ordenarStakesPorInclusao,
  statusLinha,
  stakeToLinha,
  totaisLinhas,
  validarParaSalvar,
} from "@/components/projetos/edicao/stakes/stakes-lista-utils";
import type { StakesListaFormValues } from "@/components/projetos/edicao/stakes/stakes-lista-schema";
import type {
  StakeLinha,
  StakeLinhaErros,
  StakesCatalogos,
} from "@/components/projetos/edicao/stakes/stakes-lista.types";
import { StakesLista } from "@/components/projetos/edicao/stakes/stakes-lista";
import { StakesListaSkeleton } from "@/components/projetos/edicao/stakes/stakes-lista-skeleton";
import { UsuarioAutorizadoFormModal } from "@/components/projetos/edicao/stakes/usuario-autorizado-form-modal";
import { UsuariosAutorizadosCard } from "@/components/projetos/edicao/stakes/usuarios-autorizados-card";

const PER_PAGE_USUARIOS = 15;

function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

function mapaOriginais(stakes: SgpStakeItem[] | undefined): Map<number, SgpStakeItem> {
  return new Map((stakes ?? []).map((s) => [s.sequencia, s]));
}

export interface AbaStakesProps {
  projetoId: number | string;
  nomeProjeto?: string;
  setorProjeto?: string;
  enabled?: boolean;
}

export function AbaStakes({ projetoId, nomeProjeto, enabled = true }: AbaStakesProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");
  const { setPendentes } = useAlteracoesPendentes();

  // ---- dados -------------------------------------------------------------
  const stakesQuery = useSgpStakesTodos(projetoId, { enabled });
  const usuariosQuery = useSgpUsuariosByProjetoInfinite(projetoId, {
    enabled,
    per_page: PER_PAGE_USUARIOS,
  });
  const tiposQuery = useSgpTipos({ enabled, tipo: "STAKEHOLDERS" });
  const colaboradoresQuery = useUsuariosProjetos({ enabled: enabled && canEdit });

  const salvarLote = useSalvarStakesEmLote(projetoId);
  const deleteStake = useDeleteSgpStake({ projetoId });
  const deleteUsuario = useDeleteSgpUsuario({ projetoId });

  const tiposMap = useMemo(
    () => buildSgpTiposMap(tiposQuery.data?.data ?? []),
    [tiposQuery.data?.data],
  );
  const colaboradoresMap = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const u of colaboradoresQuery.data ?? []) {
      const id = Number(u.id);
      if (Number.isFinite(id)) mapa.set(id, u.nome_suporte?.trim() ?? "");
    }
    return mapa;
  }, [colaboradoresQuery.data]);
  const catalogos: StakesCatalogos = useMemo(
    () => ({ tipos: tiposMap, colaboradores: colaboradoresMap }),
    [tiposMap, colaboradoresMap],
  );
  const tipoOptions = useMemo(
    () => [...tiposMap].map(([id, nome]) => ({ value: String(id), label: nome })),
    [tiposMap],
  );
  const colaboradorOptions = useMemo(
    () =>
      [...colaboradoresMap]
        .map(([id, nome]) => ({ value: String(id), label: nome }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [colaboradoresMap],
  );

  const usuarios = useMemo(
    () => usuariosQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [usuariosQuery.data?.pages],
  );

  // ---- formulário da lista -----------------------------------------------
  const form = useForm<StakesListaFormValues>({ defaultValues: { linhas: [] } });
  const { control, getValues, setValue } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "linhas",
    keyName: "fieldKey",
  });
  const linhasObservadas = useWatch({ control, name: "linhas" });
  // `fields` acompanha remove/append na hora; `useWatch` pode vir um render atrasado.
  const linhas = useMemo<StakeLinha[]>(
    () =>
      fields.map((field, i) => {
        const observada = linhasObservadas?.[i];
        if (observada && observada.key === field.key) return observada;
        const { fieldKey: _fieldKey, ...valores } = field;
        void _fieldKey;
        return valores;
      }),
    [fields, linhasObservadas],
  );

  /** Registros gravados conhecidos (servidor + respostas do último Salvar). */
  const [gravadosLocais, setGravadosLocais] = useState<Map<number, SgpStakeItem>>(
    () => new Map(),
  );
  const originais = useMemo(() => {
    const mapa = new Map(gravadosLocais);
    for (const [seq, stake] of mapaOriginais(stakesQuery.data)) mapa.set(seq, stake);
    return mapa;
  }, [gravadosLocais, stakesQuery.data]);

  const [erros, setErros] = useState<Map<string, StakeLinhaErros>>(() => new Map());
  const [focarLinha, setFocarLinha] = useState<number | null>(null);
  const [excluir, setExcluir] = useState<StakeLinha | null>(null);
  const [usuarioModalOpen, setUsuarioModalOpen] = useState(false);
  const [excluirUsuarioModal, setExcluirUsuarioModal] = useState<{
    open: boolean;
    usuario: SgpUsuarioProjetoItem | null;
  }>({ open: false, usuario: null });

  // Sincroniza com o servidor: carga inicial e depois de salvar/excluir (mantém o que não foi salvo).
  const originaisAnterioresRef = useRef<Map<number, SgpStakeItem> | null>(null);
  useEffect(() => {
    const dados = stakesQuery.data;
    if (!dados) return;
    const anteriores = originaisAnterioresRef.current;
    replace(
      anteriores == null
        ? ordenarStakesPorInclusao(dados).map(stakeToLinha)
        : mesclarComServidor(getValues("linhas"), dados, anteriores),
    );
    originaisAnterioresRef.current = mapaOriginais(dados);
  }, [stakesQuery.data, replace, getValues]);

  const status = useMemo(
    () => linhas.map((l) => statusLinha(l, originais)),
    [linhas, originais],
  );
  const naoSalvas = status.filter((s) => s !== "salva").length;
  const totais = useMemo(() => totaisLinhas(linhas), [linhas]);

  useEffect(() => {
    setPendentes(naoSalvas);
  }, [naoSalvas, setPendentes]);
  useEffect(() => () => setPendentes(0), [setPendentes]);

  // Linha nova: foco na Função (decisão #23), depois que a linha aparece na tela.
  useEffect(() => {
    if (focarLinha == null || focarLinha >= fields.length) return;
    const numero = focarLinha + 1;
    requestAnimationFrame(() => {
      const alvo = document.querySelector<HTMLElement>(
        `[aria-label="Função da linha ${numero}"]`,
      );
      alvo?.focus();
      alvo?.scrollIntoView({ block: "nearest" });
    });
    setFocarLinha(null);
  }, [focarLinha, fields.length]);

  // ---- ações -------------------------------------------------------------
  const adicionarLinha = useCallback(() => {
    if (!canEdit) return;
    const atuais = getValues("linhas");
    append(novaLinha(atuais[atuais.length - 1] ?? null), { shouldFocus: false });
    setFocarLinha(atuais.length);
  }, [append, canEdit, getValues]);

  const handleAlterou = useCallback(
    (index: number) => {
      const linha = getValues(`linhas.${index}`);
      if (!linha) return;
      if (linha.problemaImportacao) setValue(`linhas.${index}.problemaImportacao`, null);
      setErros((atual) => {
        if (!atual.has(linha.key)) return atual;
        const proximo = new Map(atual);
        proximo.delete(linha.key);
        return proximo;
      });
    },
    [getValues, setValue],
  );

  const handleExcluir = useCallback(
    (index: number) => {
      const linha = getValues(`linhas.${index}`);
      if (!linha) return;
      if (linha.sequencia == null) {
        remove(index);
        setErros((atual) => {
          const proximo = new Map(atual);
          proximo.delete(linha.key);
          return proximo;
        });
        return;
      }
      setExcluir(linha);
    },
    [getValues, remove],
  );

  const handleExcluirConfirm = async () => {
    if (excluir?.sequencia == null) return;
    try {
      const response = await deleteStake.mutateAsync(excluir.sequencia);
      toast.success(response.message ?? "Stakeholder excluído.");
      setExcluir(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir stakeholder.");
      throw error;
    }
  };

  const salvar = useCallback(async () => {
    if (!canEdit || salvarLote.isPending) return;
    if (tiposQuery.isLoading || colaboradoresQuery.isLoading) {
      toast("Aguarde carregar funções e colaboradores para salvar.");
      return;
    }
    const atuais = getValues("linhas");
    const { erros: errosValidacao, aSalvar } = validarParaSalvar(atuais, originais, catalogos);

    if (aSalvar.length === 0) {
      toast("Nenhuma alteração para salvar.");
      return;
    }
    if (errosValidacao.size > 0) {
      setErros(errosValidacao);
      toast.error(`Corrija ${plural(errosValidacao.size, "linha", "linhas")} antes de salvar.`);
      return;
    }

    const itens: ItemLoteStake[] = aSalvar.map((linha) => {
      const original = linha.sequencia != null ? originais.get(linha.sequencia) : undefined;
      return original && linha.sequencia != null
        ? {
            key: linha.key,
            sequencia: linha.sequencia,
            payload: linhaToUpdatePayload(linha, projetoId, original),
          }
        : { key: linha.key, sequencia: null, payload: linhaToCreatePayload(linha, projetoId) };
    });

    const resultado = await salvarLote.mutateAsync(itens);
    const porChave = new Map(resultado.itens.map((r) => [r.key, r]));

    const gravados = resultado.itens
      .map((r) => r.data)
      .filter((d): d is SgpStakeItem => d?.sequencia != null);
    if (gravados.length > 0) {
      setGravadosLocais((atual) => {
        const proximo = new Map(atual);
        for (const g of gravados) proximo.set(g.sequencia, g);
        return proximo;
      });
    }

    replace(
      getValues("linhas").map((linha) => {
        const r = porChave.get(linha.key);
        if (!r?.ok || r.data?.sequencia == null) return linha;
        return { ...stakeToLinha(r.data), key: linha.key };
      }),
    );

    const errosApi = new Map<string, StakeLinhaErros>();
    for (const r of resultado.itens) {
      if (!r.ok) errosApi.set(r.key, { campos: {}, mensagens: [r.erro ?? "Erro ao salvar"] });
    }
    setErros(errosApi);

    const partes = [
      resultado.novos > 0 ? plural(resultado.novos, "novo", "novos") : null,
      resultado.alterados > 0 ? plural(resultado.alterados, "alterado", "alterados") : null,
    ].filter(Boolean);
    if (partes.length > 0) toast.success(`Stakeholders salvos: ${partes.join(" e ")}.`);
    if (resultado.falhas > 0) {
      toast.error(
        `${plural(resultado.falhas, "linha não foi salva", "linhas não foram salvas")}. Veja a mensagem embaixo de cada uma.`,
      );
    }
  }, [
    canEdit,
    catalogos,
    colaboradoresQuery.isLoading,
    getValues,
    originais,
    projetoId,
    replace,
    salvarLote,
    tiposQuery.isLoading,
  ]);

  // Ctrl+S salva enquanto a aba está aberta (decisão #23).
  const salvarRef = useRef(salvar);
  useEffect(() => {
    salvarRef.current = salvar;
  }, [salvar]);
  useEffect(() => {
    if (!enabled || !canEdit) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void salvarRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, canEdit]);

  // ---- usuários autorizados (sem mudança) --------------------------------
  const handleExcluirUsuarioConfirm = async () => {
    const sequencia = excluirUsuarioModal.usuario?.sequencia;
    if (!sequencia) return;
    try {
      const response = await deleteUsuario.mutateAsync(sequencia);
      toast.success(response.message ?? "Usuário autorizado excluído com sucesso.");
      setExcluirUsuarioModal({ open: false, usuario: null });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir usuário autorizado.",
      );
      throw error;
    }
  };

  const nomeUsuarioExcluir =
    excluirUsuarioModal.usuario != null
      ? getUsuarioNomeExibicao(
          excluirUsuarioModal.usuario.nome,
          excluirUsuarioModal.usuario.usuario,
        )
      : "este usuário";

  const isInitialLoading =
    enabled &&
    ((stakesQuery.isLoading && !stakesQuery.data) ||
      (usuariosQuery.isLoading && !usuariosQuery.data));

  if (isInitialLoading) return <StakesListaSkeleton />;

  return (
    <div className="flex flex-col gap-2">
      <FormProvider {...form}>
        <StakesLista
          projetoId={projetoId}
          nomeProjeto={nomeProjeto}
          linhas={linhas}
          chaves={fields.map((f) => f.fieldKey)}
          status={status}
          erros={erros}
          totais={totais}
          naoSalvas={naoSalvas}
          tipoOptions={tipoOptions}
          colaboradorOptions={colaboradorOptions}
          isLoadingColaboradores={colaboradoresQuery.isLoading}
          canEdit={canEdit}
          isSalvando={salvarLote.isPending}
          isError={stakesQuery.isError}
          errorMessage={
            stakesQuery.error instanceof Error ? stakesQuery.error.message : undefined
          }
          onTentarDeNovo={() => void stakesQuery.refetch()}
          onAdicionar={adicionarLinha}
          onSalvar={() => void salvar()}
          onAlterou={handleAlterou}
          onExcluir={handleExcluir}
        />
      </FormProvider>

      <UsuariosAutorizadosCard
        usuarios={usuarios}
        isLoading={usuariosQuery.isLoading}
        isError={usuariosQuery.isError}
        errorMessage={
          usuariosQuery.error instanceof Error ? usuariosQuery.error.message : undefined
        }
        hasNextPage={usuariosQuery.hasNextPage ?? false}
        isFetchingNextPage={usuariosQuery.isFetchingNextPage}
        onLoadMore={() => usuariosQuery.fetchNextPage()}
        onAdicionar={() => setUsuarioModalOpen(true)}
        onExcluir={(usuario) => setExcluirUsuarioModal({ open: true, usuario })}
      />

      <UsuarioAutorizadoFormModal
        open={usuarioModalOpen}
        onOpenChange={setUsuarioModalOpen}
        projetoId={projetoId}
        usuariosVinculados={usuarios}
      />

      <ConfirmacaoModal
        open={excluir != null}
        onOpenChange={(open) => {
          if (!open) setExcluir(null);
        }}
        titulo="Excluir stakeholder"
        descricao={`Tem certeza que deseja excluir ${excluir?.colaboradorLabel?.trim() || "este stakeholder"}? Esta ação não pode ser desfeita.`}
        confirmarLabel="Excluir"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirConfirm}
        variant="danger"
        isLoading={deleteStake.isPending}
      />

      <ConfirmacaoModal
        open={excluirUsuarioModal.open}
        onOpenChange={(open) => {
          if (!open) setExcluirUsuarioModal({ open: false, usuario: null });
        }}
        titulo="Remover usuário autorizado"
        descricao={`Tem certeza que deseja remover ${nomeUsuarioExcluir} deste projeto? Esta ação não pode ser desfeita.`}
        confirmarLabel="Remover"
        cancelarLabel="Cancelar"
        onConfirm={handleExcluirUsuarioConfirm}
        variant="danger"
        isLoading={deleteUsuario.isPending}
      />
    </div>
  );
}
