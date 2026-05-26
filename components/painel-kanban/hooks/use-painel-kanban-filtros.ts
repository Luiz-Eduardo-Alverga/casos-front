"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { getUser } from "@/lib/auth";
import type { PainelKanbanFiltrosForm } from "@/interfaces/kanban/painel-kanban-filtros-form";
import {
  readPainelKanbanFiltros,
  writePainelKanbanFiltros,
} from "@/components/painel-kanban/filtros/painel-kanban-filtros-storage";
import {
  apiFiltrosFromFormValues,
  buildKanbanFiltrosFromStorage,
  getInitialKanbanFiltrosBootstrap,
  type PainelKanbanApiFiltros,
} from "@/components/painel-kanban/filtros/build-kanban-filtros-state";

interface UsePainelKanbanFiltrosParams {
  methods: UseFormReturn<PainelKanbanFiltrosForm>;
  idColaborador: string;
  nomeColaborador: string;
}

export function usePainelKanbanFiltros({
  methods,
  idColaborador,
  nomeColaborador,
}: UsePainelKanbanFiltrosParams) {
  const { reset, setValue, watch, getValues } = methods;
  const [hydrated, setHydrated] = useState(false);
  const [apiFiltros, setApiFiltros] = useState<PainelKanbanApiFiltros | null>(
    () =>
      typeof window !== "undefined"
        ? getInitialKanbanFiltrosBootstrap(idColaborador, nomeColaborador).api
        : null,
  );

  const hasHydratedRef = useRef(false);
  const isPersistingRef = useRef(false);
  const prevDevRef = useRef<string | null>(null);
  const prevProjetoRef = useRef<string | null>(null);

  const devAtribuido = watch("devAtribuido");
  const projeto = watch("projeto");

  useLayoutEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const loggedUser = getUser();
    const saved = readPainelKanbanFiltros();
    const { form, api } = buildKanbanFiltrosFromStorage(
      loggedUser,
      saved,
      idColaborador,
      nomeColaborador,
    );

    isPersistingRef.current = true;
    reset(form);
    setApiFiltros(api);
    prevDevRef.current = form.devAtribuido ?? "";
    prevProjetoRef.current = form.projeto ?? "";
    isPersistingRef.current = false;
    setHydrated(true);

    const savedDevId =
      saved?.devAtribuido != null ? String(saved.devAtribuido).trim() : "";
    if (!savedDevId && form.devAtribuido) {
      writePainelKanbanFiltros({
        devAtribuido: form.devAtribuido,
        devAtribuidoLabel: form.devAtribuidoLabel,
        devAtribuidoSetor: form.devAtribuidoSetor,
        projeto: form.projeto,
        projetoDataFinal: form.projetoDataFinal,
      });
    }
  }, [idColaborador, nomeColaborador, reset]);

  useEffect(() => {
    if (!hydrated) return;

    const sub = watch((values) => {
      if (isPersistingRef.current) return;

      writePainelKanbanFiltros({
        produto: values.produto ?? "",
        versao: values.versao ?? "",
        devAtribuido: String(values.devAtribuido ?? "").trim()
          ? String(values.devAtribuido)
          : idColaborador,
        devAtribuidoLabel: (values.devAtribuidoLabel ?? "").trim()
          ? values.devAtribuidoLabel
          : nomeColaborador,
        devAtribuidoSetor: (values.devAtribuidoSetor ?? "").trim(),
        projeto: (values.projeto ?? "").trim(),
        projetoDataFinal: (values.projetoDataFinal ?? "").trim(),
      });
    });

    return () => sub.unsubscribe();
  }, [hydrated, idColaborador, nomeColaborador, watch]);

  const clearProjetoOnDevChange = useCallback(() => {
    setValue("projeto", "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    setValue("projetoDataFinal", "", {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    writePainelKanbanFiltros({ projeto: "", projetoDataFinal: "" });
  }, [setValue]);

  useEffect(() => {
    if (!hydrated || isPersistingRef.current) return;

    const dev = String(devAtribuido ?? "").trim() || idColaborador;
    const proj = projeto?.trim() ?? "";
    const prevDev = prevDevRef.current;
    const prevProj = prevProjetoRef.current;

    if (prevDev === null) {
      prevDevRef.current = dev;
      prevProjetoRef.current = proj;
      return;
    }

    const devChanged = prevDev !== dev;
    const projetoChanged = prevProj !== proj;

    if (devChanged) {
      clearProjetoOnDevChange();
      const values = getValues();
      const nextApi = apiFiltrosFromFormValues(
        { devAtribuido: dev, projeto: "" },
        idColaborador,
      );
      setApiFiltros(nextApi);
      prevDevRef.current = dev;
      prevProjetoRef.current = "";
      return;
    }

    if (projetoChanged) {
      const values = getValues();
      const nextApi = apiFiltrosFromFormValues(
        { devAtribuido: values.devAtribuido, projeto: proj },
        idColaborador,
      );
      setApiFiltros(nextApi);
      prevProjetoRef.current = proj;
    }
  }, [
    clearProjetoOnDevChange,
    devAtribuido,
    getValues,
    hydrated,
    idColaborador,
    projeto,
  ]);

  const usuarioDevId = String(devAtribuido ?? "").trim() || idColaborador;

  return {
    hydrated,
    apiFiltros,
    usuarioDevId,
  };
}
