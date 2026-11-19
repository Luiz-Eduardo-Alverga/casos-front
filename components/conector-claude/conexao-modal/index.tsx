"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Copy, Loader2, Plug, Unplug } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useClaudeConexao,
  useDesconectarClaude,
} from "@/hooks/claude-conexao/use-claude-conexao";
import type { ClaudeConexaoStatus } from "@/services/conector-claude/conexao";
import { ConexaoPill } from "./conexao-pill";

interface ConexaoClaudeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal "Conexão com o Claude" (decisão #10), aberto pelo item "Claude" do menu do usuário. */
export function ConexaoClaudeModal({ open, onOpenChange }: ConexaoClaudeModalProps) {
  const { data, isLoading, isError, refetch, isFetching } = useClaudeConexao(open);
  const [confirmando, setConfirmando] = useState(false);

  const fechar = (v: boolean) => {
    if (!v) setConfirmando(false);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="w-[min(96vw,480px)] max-w-[480px] gap-0 p-0 sm:rounded-2xl">
        {confirmando && data?.conectado ? (
          <ConfirmarDesconexao
            onCancelar={() => setConfirmando(false)}
            onDesconectado={() => setConfirmando(false)}
          />
        ) : (
          <>
            <div className="flex flex-col gap-2 p-6 pb-4 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <Plug className="h-4 w-4 text-text-primary" />
                <DialogTitle className="text-lg font-semibold text-text-primary">
                  Conexão com o Claude
                </DialogTitle>
                {data && <ConexaoPill conectado={data.conectado} />}
              </div>
              <DialogDescription className="text-sm text-text-secondary">
                {data?.conectado
                  ? "O Claude consulta e abre casos em seu nome, com as suas permissões, sempre depois que você confirma no chat."
                  : "Conecte para o Claude abrir casos no fim do planejamento, sem você sair do chat."}
              </DialogDescription>
            </div>

            <div className="px-6 pb-6">
              {isLoading ? (
                <ConexaoSkeleton />
              ) : isError || !data ? (
                <div className="flex flex-col items-start gap-2 rounded-lg border border-border-input p-4">
                  <p className="text-sm text-text-error">
                    Não foi possível carregar a conexão com o Claude.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    Tentar de novo
                  </Button>
                </div>
              ) : data.conectado ? (
                <Conectado data={data} />
              ) : (
                <SemConexao endereco={data.enderecoConector} />
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                {data?.conectado && (
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmando(true)}
                    className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Unplug className="h-4 w-4" />
                    Desconectar
                  </Button>
                )}
                <Button variant="outline" onClick={() => fechar(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 px-4 py-3 text-sm">
      <span className="text-text-secondary">{rotulo}</span>
      <span className="text-text-primary">{valor}</span>
    </div>
  );
}

function Conectado({ data }: { data: ClaudeConexaoStatus }) {
  const desde = data.conectadoEm
    ? format(new Date(data.conectadoEm), "dd/MM/yyyy HH:mm")
    : "-";
  const ultimoUso = data.ultimoUsoEm
    ? formatDistanceToNow(new Date(data.ultimoUsoEm), {
        addSuffix: true,
        locale: ptBR,
      })
    : "ainda não usado";
  return (
    <div className="divide-y divide-border-divider rounded-lg border border-border-input">
      <Linha rotulo="Conectado desde" valor={desde} />
      <Linha rotulo="Último uso" valor={ultimoUso} />
      <Linha rotulo="Pode abrir casos" valor={data.podeAbrirCaso ? "Sim" : "Não"} />
    </div>
  );
}

const PASSOS: React.ReactNode[] = [
  <>
    No Claude, abra <strong>Customize → Connectors</strong> e clique em{" "}
    <strong>Add custom connector</strong>.
  </>,
  <>
    Cole o endereço abaixo e clique em <strong>Add</strong>.
  </>,
  <>
    Confira seus dados no Softflow, digite sua senha e clique em{" "}
    <strong>Permitir acesso</strong>.
  </>,
];

function SemConexao({ endereco }: { endereco: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(endereco);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar; selecione o endereço e copie.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2">
        {PASSOS.map((passo, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-text-label">
              {i + 1}
            </span>
            <span className="pt-0.5">{passo}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-label">Endereço do conector</span>
        <div className="flex gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md border border-border-input px-3 py-2 font-mono text-xs text-text-primary">
            {endereco}
          </code>
          <Button variant="outline" onClick={copiar} className="shrink-0">
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Copiado" : "Copiar"}
          </Button>
        </div>
        <p className="text-xs text-text-secondary">
          Funciona em contas Pro e Max. No plano Free, o Claude aceita só um
          conector personalizado.
        </p>
      </div>
    </div>
  );
}

function ConexaoSkeleton() {
  return (
    <div className="divide-y divide-border-divider rounded-lg border border-border-input">
      {[0, 1].map((i) => (
        <div key={i} className="grid grid-cols-[140px_1fr] gap-2 px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

function ConfirmarDesconexao({
  onCancelar,
  onDesconectado,
}: {
  onCancelar: () => void;
  onDesconectado: () => void;
}) {
  const desconectar = useDesconectarClaude();

  // mutateAsync: o status novo (não conectado) desmonta este bloco antes dos callbacks do `mutate`.
  async function confirmar() {
    try {
      await desconectar.mutateAsync();
      toast.success("Claude desconectado", { position: "top-right" });
      onDesconectado();
    } catch {
      toast.error("Não foi possível desconectar. Tente de novo.", {
        position: "top-right",
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 pr-12">
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-lg font-semibold text-text-primary">
          Desconectar o Claude?
        </DialogTitle>
        <DialogDescription className="text-sm text-text-secondary">
          O Claude não vai mais abrir nem consultar casos em seu nome até você
          conectar de novo.
        </DialogDescription>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancelar} disabled={desconectar.isPending}>
          Cancelar
        </Button>
        <Button
          variant="destructive"
          onClick={confirmar}
          disabled={desconectar.isPending}
        >
          {desconectar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Desconectar
        </Button>
      </div>
    </div>
  );
}
