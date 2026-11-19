"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ConfirmacaoModal } from "@/components/confirmacao-modal";

/**
 * Guarda de alterações não salvas da edição de projeto (decisão #22): uma aba com mudanças
 * locais (hoje, a lista de Stakes) informa quantas linhas estão pendentes; trocar de aba, Voltar,
 * clicar em link do app ou fechar/recarregar a página pede "Descartar alterações?".
 */
interface AlteracoesPendentesContextValue {
  /** A aba informa quantas alterações não salvas tem (0 = nenhuma). */
  setPendentes: (quantidade: number) => void;
  /** Executa `acao` direto ou depois de confirmar o descarte, se houver pendências. */
  confirmarDescarte: (acao: () => void) => void;
}

const AlteracoesPendentesContext =
  createContext<AlteracoesPendentesContextValue | null>(null);

export function useAlteracoesPendentes(): AlteracoesPendentesContextValue {
  const ctx = useContext(AlteracoesPendentesContext);
  return (
    ctx ?? {
      setPendentes: () => {},
      confirmarDescarte: (acao) => acao(),
    }
  );
}

function hrefInterno(alvo: EventTarget | null): string | null {
  if (!(alvo instanceof Element)) return null;
  const link = alvo.closest("a[href]");
  if (!(link instanceof HTMLAnchorElement)) return null;
  if (link.target && link.target !== "_self") return null;
  if (link.hasAttribute("download")) return null;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  const atual = window.location.pathname + window.location.search;
  const destino = url.pathname + url.search;
  if (destino === atual) return null;
  return destino + url.hash;
}

export function AlteracoesPendentesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pendentes, setPendentes] = useState(0);
  const [acaoPendente, setAcaoPendente] = useState<(() => void) | null>(null);
  const pendentesRef = useRef(0);
  pendentesRef.current = pendentes;

  const confirmarDescarte = useCallback((acao: () => void) => {
    if (pendentesRef.current > 0) setAcaoPendente(() => acao);
    else acao();
  }, []);

  useEffect(() => {
    if (pendentes <= 0) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const onClickCaptura = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const destino = hrefInterno(event.target);
      if (!destino) return;
      event.preventDefault();
      event.stopPropagation();
      setAcaoPendente(() => () => router.push(destino));
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCaptura, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCaptura, true);
    };
  }, [pendentes, router]);

  const value = useMemo(
    () => ({ setPendentes, confirmarDescarte }),
    [confirmarDescarte],
  );

  return (
    <AlteracoesPendentesContext.Provider value={value}>
      {children}
      <ConfirmacaoModal
        open={acaoPendente != null}
        onOpenChange={(open) => {
          if (!open) setAcaoPendente(null);
        }}
        titulo="Descartar alterações?"
        descricao={`Há ${pendentes === 1 ? "1 linha não salva" : `${pendentes} linhas não salvas`} na aba Stakes. Se continuar, elas voltam para o que está gravado.`}
        confirmarLabel="Descartar"
        cancelarLabel="Continuar editando"
        variant="danger"
        onConfirm={() => {
          const acao = acaoPendente;
          setAcaoPendente(null);
          setPendentes(0);
          acao?.();
        }}
      />
    </AlteracoesPendentesContext.Provider>
  );
}
