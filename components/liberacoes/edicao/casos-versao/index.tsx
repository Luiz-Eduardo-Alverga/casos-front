"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCheck, FileText, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/painel/empty-state";
import { useCasosVersao } from "@/components/liberacoes/edicao/casos-versao/use-casos-versao";
import { CasosVersaoRow } from "@/components/liberacoes/edicao/casos-versao/casos-versao-row";
import { CasosVersaoSkeleton } from "@/components/liberacoes/edicao/casos-versao/casos-versao-skeleton";
import { DescricaoGeradaCard } from "@/components/liberacoes/edicao/casos-versao/descricao-gerada-card";
import {
  isCasoVersaoRowDirty,
  type CasoVersaoRowState,
} from "@/components/liberacoes/edicao/casos-versao/utils";
import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import { useGenerateReleaseNotes } from "@/hooks/assistant/use-generate-release-notes";
import type { ReleaseNotesData } from "@/lib/types/release-notes";
import type { LiberacaoVersao } from "@/interfaces/liberacao";

type SavedCasoVersaoFields = {
  descricao: string;
  liberacao: boolean;
};

export interface AbaCasosVersaoProps {
  registro: number | string;
  versoes: LiberacaoVersao[];
  enabled?: boolean;
}

export function AbaCasosVersao({
  registro,
  versoes,
  enabled = true,
}: AbaCasosVersaoProps) {
  const queryClient = useQueryClient();
  const updateCaso = useUpdateCaso();
  const generateReleaseNotes = useGenerateReleaseNotes();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useCasosVersao(registro, { enabled: enabled && versoes.length > 0 });

  const base = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const totalCasos = useMemo(() => {
    const firstPage = data?.pages[0];
    if (!firstPage) return 0;
    return firstPage.total_casos;
  }, [data]);

  const [rows, setRows] = useState<CasoVersaoRowState[]>([]);
  const [savedById, setSavedById] = useState<
    Record<string, SavedCasoVersaoFields>
  >({});
  const rowsRef = useRef(rows);
  const savedByIdRef = useRef(savedById);
  rowsRef.current = rows;
  savedByIdRef.current = savedById;

  const [selected, setSelected] = useState<string[]>([]);
  const [resultado, setResultado] = useState<ReleaseNotesData | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkMarking, setBulkMarking] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const generating = generateReleaseNotes.isPending;

  useEffect(() => {
    const prevById = new Map(rowsRef.current.map((row) => [row.id, row]));
    const prevSaved = savedByIdRef.current;
    const nextSaved: Record<string, SavedCasoVersaoFields> = {};

    const nextRows = base.map((serverRow) => {
      const local = prevById.get(serverRow.id);
      const saved = prevSaved[serverRow.id];
      const isDirty =
        local != null && saved != null && isCasoVersaoRowDirty(local, saved);

      nextSaved[serverRow.id] =
        isDirty && saved
          ? saved
          : {
              descricao: serverRow.descricao,
              liberacao: serverRow.liberacao,
            };

      if (isDirty && local) {
        return {
          ...serverRow,
          descricao: local.descricao,
          liberacao: local.liberacao,
        };
      }

      return { ...serverRow };
    });

    rowsRef.current = nextRows;
    savedByIdRef.current = nextSaved;
    setRows(nextRows);
    setSavedById(nextSaved);
    setSelected((prev) =>
      prev.filter((id) => base.some((row) => row.id === id)),
    );
  }, [base]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allChecked = rows.length > 0 && selected.length === rows.length;
  const toggleAll = () =>
    setSelected(allChecked ? [] : rows.map((row) => row.id));
  const toggleOne = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleGerar = async () => {
    setResultado(null);
    try {
      const data = await generateReleaseNotes.mutateAsync(registro);
      setResultado(data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Erro ao gerar registro de liberação com IA.",
      );
    }
  };

  const handleBulkMarcarLiberacao = async () => {
    const alvo = rows.filter((row) => selected.includes(row.id));
    if (alvo.length === 0) return;

    setBulkMarking(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const row of alvo) {
        try {
          await updateCaso.mutateAsync({
            id: row.id,
            data: {
              PassosParaReproduzir: row.descricao,
              Liberacao: true,
            },
          });

          const nextRow = { ...row, liberacao: true };
          rowsRef.current = rowsRef.current.map((r) =>
            r.id === row.id ? nextRow : r,
          );
          const nextSaved = {
            ...savedByIdRef.current,
            [row.id]: {
              descricao: row.descricao,
              liberacao: true,
            },
          };
          savedByIdRef.current = nextSaved;
          setSavedById(nextSaved);
          setRows(rowsRef.current);
          successCount += 1;
        } catch {
          failCount += 1;
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["liberacoes", registro, "itens"],
      });

      if (failCount === 0) {
        toast.success(
          `${successCount} caso${successCount > 1 ? "s" : ""} marcado${successCount > 1 ? "s" : ""} para liberação.`,
        );
      } else if (successCount === 0) {
        toast.error("Não foi possível marcar os casos selecionados.");
      } else {
        toast.error(
          `${successCount} marcado${successCount > 1 ? "s" : ""}, ${failCount} com erro.`,
        );
      }
    } finally {
      setBulkMarking(false);
    }
  };

  const handleSave = async (row: CasoVersaoRowState) => {
    setSavingId(row.id);
    try {
      await updateCaso.mutateAsync({
        id: row.id,
        data: {
          PassosParaReproduzir: row.descricao,
          Liberacao: row.liberacao,
        },
      });
      const nextSaved = {
        ...savedByIdRef.current,
        [row.id]: {
          descricao: row.descricao,
          liberacao: row.liberacao,
        },
      };
      savedByIdRef.current = nextSaved;
      setSavedById(nextSaved);
      toast.success(`Caso #${row.id} salvo com sucesso.`);
      await queryClient.invalidateQueries({
        queryKey: ["liberacoes", registro, "itens"],
      });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Erro ao salvar o caso #${row.id}.`,
      );
    } finally {
      setSavingId(null);
    }
  };

  if (versoes.length === 0) {
    return (
      <Card className="rounded-lg bg-card shadow-card">
        <CardContent className="p-6">
          <EmptyState
            icon={FileText}
            title="Nenhuma versão vinculada"
            description="Adicione uma versão na aba Liberação para ver os casos relacionados."
          />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Erro ao carregar casos da versão."}
      </p>
    );
  }

  if (isLoading) {
    return <CasosVersaoSkeleton rows={5} />;
  }

  if (rows.length === 0) {
    return (
      <Card className="rounded-lg bg-card shadow-card">
        <CardContent className="p-6">
          <EmptyState
            icon={FileText}
            title="Nenhum caso para esta versão"
            description="Ainda não há casos vinculados a este produto e versão."
          />
        </CardContent>
      </Card>
    );
  }

  const totalizadorLabel =
    selected.length > 0
      ? `${selected.length} selecionado${selected.length > 1 ? "s" : ""}`
      : `${totalCasos} ${totalCasos === 1 ? "caso" : "casos"} nesta versão`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <label className="flex items-center gap-2 text-[12.5px] text-text-secondary">
          <Checkbox
            checked={allChecked}
            onCheckedChange={() => toggleAll()}
            aria-label="Selecionar todos os casos"
          />
          {totalizadorLabel}
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={selected.length === 0 || bulkMarking || generating}
            onClick={() => void handleBulkMarcarLiberacao()}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar para liberação
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={generating || bulkMarking}
            onClick={() => void handleGerar()}
            className="bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Gerar descrição com IA
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 pb-6 lg:grid-cols-[1fr_600px]">
        <div className="space-y-2">
          {rows.map((row) => (
            <CasosVersaoRow
              key={row.id}
              item={row}
              selected={selected.includes(row.id)}
              isSaving={savingId === row.id}
              canSave={isCasoVersaoRowDirty(row, savedById[row.id])}
              onToggleSelected={() => toggleOne(row.id)}
              onDescricaoChange={(value) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, descricao: value } : r,
                  ),
                )
              }
              onLiberacaoChange={(value) =>
                setRows((prev) =>
                  prev.map((r) =>
                    r.id === row.id ? { ...r, liberacao: value } : r,
                  ),
                )
              }
              onSave={() => void handleSave(row)}
            />
          ))}

          {isFetchingNextPage && <CasosVersaoSkeleton rows={3} />}
          {hasNextPage && rows.length > 0 && (
            <div ref={loadMoreRef} className="mt-4 min-h-[48px]" aria-hidden />
          )}
        </div>

        <DescricaoGeradaCard generating={generating} resultado={resultado} />
      </div>
    </div>
  );
}
