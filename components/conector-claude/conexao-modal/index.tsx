"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, Check, Loader2, Plug, Sparkles, Unplug } from "lucide-react";
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
import { LogosConector } from "../logos-conector";
import { ConexaoPill } from "./conexao-pill";
import { EnderecoCopiavel } from "./endereco-copiavel";
import { PassosNumerados, type Passo } from "./passos-numerados";

interface ConexaoClaudeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal "Conexão com o Claude" (decisões #10, #17 e #19), aberto pelo item "Claude" do menu do
 * usuário. Coluna escura que explica e coluna clara com as seções Softflow e Brainiac; no mobile,
 * tela cheia com as colunas empilhadas.
 */
export function ConexaoClaudeModal({ open, onOpenChange }: ConexaoClaudeModalProps) {
  const { data, isLoading, isError, refetch, isFetching } = useClaudeConexao(open);
  const [confirmando, setConfirmando] = useState(false);

  const fechar = (v: boolean) => {
    if (!v) setConfirmando(false);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="w-[min(96vw,880px)] max-w-[880px] gap-0 overflow-hidden border-0 bg-transparent p-0 max-md:inset-0 max-md:block max-md:h-full max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:overflow-y-auto max-md:rounded-none max-md:[&>button:last-child]:text-primary-foreground md:flex md:max-h-[calc(100vh-32px)] md:flex-row md:rounded-2xl">
        <ColunaExplicacao />

        <section className="flex min-w-0 flex-1 flex-col gap-6 bg-card p-6 md:min-h-0 md:overflow-y-auto md:p-8 md:pb-6">
          {confirmando && data?.conectado ? (
            <ConfirmarDesconexao
              onCancelar={() => setConfirmando(false)}
              onDesconectado={() => setConfirmando(false)}
            />
          ) : (
            <>
              <DialogTitle className="pr-6 text-lg font-semibold text-text-primary">
                Conexão com o Claude
              </DialogTitle>

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
              ) : (
                <div className="flex flex-col gap-6">
                  <SecaoSoftflow data={data} />
                  <SecaoBrainiac data={data} />
                </div>
              )}

              <div className="mt-auto flex flex-wrap justify-end gap-2">
                {data?.conectado && (
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmando(true)}
                    className="bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Unplug className="h-4 w-4" />
                    Desconectar o Softflow
                  </Button>
                )}
                <Button variant="outline" onClick={() => fechar(false)}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

const O_QUE_FAZ = [
  "Busca produto, versão, projeto e pessoas pelo nome",
  "Mostra a prévia e abre o caso depois do seu ok",
  "Consulta casos pelo número",
];

/** Coluna escura: não depende de dados (mesmo padrão da tela de autorização). */
function ColunaExplicacao() {
  return (
    <aside className="flex shrink-0 flex-col gap-6 bg-primary px-4 py-6 md:min-h-0 md:w-80 md:overflow-y-auto md:px-6 md:py-8">
      <LogosConector tamanho="sm" />
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-primary-foreground">
          Planeje no Claude e abra o caso sem sair do chat
        </h2>
        <DialogDescription className="text-sm text-primary-foreground/70">
          O Claude usa a sua conta do Softflow, com as suas permissões. Nada é
          criado sem você confirmar a prévia no chat.
        </DialogDescription>
      </div>
      <div className="hidden flex-col gap-2 md:flex">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
          Com o Softflow conectado
        </h3>
        <ul className="flex flex-col gap-2">
          {O_QUE_FAZ.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-primary-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4 text-sm">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
        <p className="text-primary-foreground/70">
          <strong className="font-semibold text-primary-foreground">
            Com o Brainiac também,
          </strong>{" "}
          o Claude conhece os produtos, os padrões da squad e a skill de
          planejamento (xp-planejar). Sem ele, abre casos, mas planeja sem esse
          contexto.
        </p>
      </div>
    </aside>
  );
}

function CabecalhoSecao({
  icone,
  nome,
  pilula,
}: {
  icone: React.ReactNode;
  nome: string;
  pilula: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-text-primary">
        {icone}
      </span>
      <span className="text-base font-semibold text-text-primary">{nome}</span>
      <span className="ml-auto">{pilula}</span>
    </div>
  );
}

const PASSOS_SOFTFLOW: Passo[] = [
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

function SecaoSoftflow({ data }: { data: ClaudeConexaoStatus }) {
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoSecao
        icone={<Plug className="h-4 w-4" />}
        nome="Softflow"
        pilula={<ConexaoPill conectado={data.conectado} />}
      />
      {data.conectado ? (
        <Conectado data={data} />
      ) : (
        <>
          <PassosNumerados passos={PASSOS_SOFTFLOW} />
          <div className="flex flex-col gap-2">
            <EnderecoCopiavel
              rotulo="Endereço do conector"
              valor={data.enderecoConector}
              ariaLabel="Copiar endereço do Softflow"
            />
            <p className="text-xs text-text-secondary">
              Funciona em contas Pro e Max. No plano Free, o Claude aceita só um
              conector personalizado.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const PASSOS_BRAINIAC: Passo[] = [
  <>
    No Claude, abra <strong>Customize → Connectors → Add custom connector</strong>.
  </>,
  <>
    Cole o endereço e, em <strong>Advanced settings</strong>, informe o Client
    ID. Clique em <strong>Add</strong>.
  </>,
  <>
    Entre com seu e-mail e senha de colaborador Softcom, clique em{" "}
    <strong>Entrar no Brainiac</strong> e depois em{" "}
    <strong>Autorizar acesso</strong>.
  </>,
];

const JA_CONECTOU = "Se você já conectou o Brainiac, não precisa fazer nada.";

/** Recomendação do Brainiac: sempre a mesma pílula, sem status (decisão #17). */
function SecaoBrainiac({ data }: { data: ClaudeConexaoStatus }) {
  const { endereco, clientId } = data.brainiac;
  return (
    <div className="flex flex-col gap-4 border-t border-border-divider pt-6">
      <CabecalhoSecao
        icone={<BookOpen className="h-4 w-4" />}
        nome="Brainiac"
        pilula={
          <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            Recomendado
          </span>
        }
      />
      {data.conectado ? (
        <>
          <PassosNumerados passos={PASSOS_BRAINIAC} />
          <p className="text-xs text-text-secondary">{JA_CONECTOU}</p>
        </>
      ) : (
        <p className="text-sm text-text-secondary">
          Adicione do mesmo jeito. Em{" "}
          <strong className="font-semibold text-text-primary">Advanced settings</strong>,
          informe o Client ID. {JA_CONECTOU}
        </p>
      )}
      {endereco && (
        <EnderecoCopiavel
          rotulo="Endereço"
          valor={endereco}
          ariaLabel="Copiar endereço do Brainiac"
        />
      )}
      {clientId && (
        <EnderecoCopiavel
          rotulo="OAuth Client ID"
          valor={clientId}
          ariaLabel="Copiar Client ID do Brainiac"
        />
      )}
    </div>
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

/** Espelha as duas seções: cabeçalho com pílula, três linhas e um campo. */
function ConexaoSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[0, 1].map((s) => (
        <div
          key={s}
          className={
            s
              ? "flex flex-col gap-4 border-t border-border-divider pt-6"
              : "flex flex-col gap-4"
          }
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-5 w-24 rounded-full" />
          </div>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-4 w-full max-w-sm" />
          ))}
          <Skeleton className="h-9 w-full" />
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
    <div className="flex flex-col gap-4 pr-6">
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-lg font-semibold text-text-primary">
          Desconectar o Claude?
        </DialogTitle>
        <p className="text-sm text-text-secondary">
          O Claude não vai mais abrir nem consultar casos em seu nome até você
          conectar de novo.
        </p>
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
