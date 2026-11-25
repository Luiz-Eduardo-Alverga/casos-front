"use client";

import { useEffect, useState } from "react";
import { Plug, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ClaudeConexaoStatus,
  TipoClienteConexao,
} from "@/services/conector-claude/conexao";
import { CabecalhoSecao } from "./cabecalho-secao";
import { ConexaoPill } from "./conexao-pill";
import { InstrucoesSoftflow } from "./instrucoes-softflow";
import { NOME_CONEXAO, resumoConexao, TIPOS_CONEXAO } from "./utils";

const ABA_STORAGE_KEY = "softflow:conector-claude:aba";

function lerAbaSalva(): TipoClienteConexao {
  try {
    return window.localStorage.getItem(ABA_STORAGE_KEY) === "claude-code"
      ? "claude-code"
      : "claude";
  } catch {
    return "claude";
  }
}

function salvarAba(tipo: TipoClienteConexao) {
  try {
    window.localStorage.setItem(ABA_STORAGE_KEY, tipo);
  } catch {
    // localStorage indisponível (modo privado, cota): só não lembra a escolha.
  }
}

/** Seção Softflow do modal: seletor + passos sem conexão; lista por tipo de cliente com conexão. */
export function SecaoSoftflow({
  data,
  onDesconectar,
}: {
  data: ClaudeConexaoStatus;
  onDesconectar: (tipo: TipoClienteConexao) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoSecao
        icone={<Plug className="h-4 w-4" />}
        nome="Softflow"
        pilula={<ConexaoPill conectado={data.conectado} />}
      />
      {data.conectado ? (
        <ListaConexoes data={data} onDesconectar={onDesconectar} />
      ) : (
        <SeletorTipo endereco={data.enderecoConector} />
      )}
    </div>
  );
}

/** "Claude (app e web)" | "Claude Code"; abre na última escolha (decisão #25). */
function SeletorTipo({ endereco }: { endereco: string }) {
  const [aba, setAba] = useState<TipoClienteConexao>("claude");
  useEffect(() => setAba(lerAbaSalva()), []);

  return (
    <Tabs
      value={aba}
      onValueChange={(v) => {
        const tipo = v as TipoClienteConexao;
        setAba(tipo);
        salvarAba(tipo);
      }}
      className="flex flex-col gap-4"
    >
      <TabsList
        aria-label="Onde você usa o Claude"
        className="grid h-auto w-full grid-cols-2"
      >
        {TIPOS_CONEXAO.map((tipo) => (
          <TabsTrigger key={tipo} value={tipo} className="h-8">
            {NOME_CONEXAO[tipo]}
          </TabsTrigger>
        ))}
      </TabsList>
      {TIPOS_CONEXAO.map((tipo) => (
        <TabsContent key={tipo} value={tipo} className="mt-0">
          <InstrucoesSoftflow tipo={tipo} endereco={endereco} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

const SEM_CONEXAO: Record<TipoClienteConexao, string> = {
  claude: "Para planejar e abrir casos pelo chat",
  "claude-code": "Para implementar casos no terminal",
};

/** Uma linha por tipo de cliente, com Desconectar ou "Como conectar" (decisão #25). */
function ListaConexoes({
  data,
  onDesconectar,
}: {
  data: ClaudeConexaoStatus;
  onDesconectar: (tipo: TipoClienteConexao) => void;
}) {
  const [abrindo, setAbrindo] = useState<TipoClienteConexao | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <div className="divide-y divide-border-divider rounded-lg border border-border-input">
        {TIPOS_CONEXAO.map((tipo) => {
          const conexao = data.conexoes.find((c) => c.tipo === tipo);
          const nome = NOME_CONEXAO[tipo];
          return (
            <div key={tipo} className="flex flex-col gap-4 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium text-text-primary">{nome}</span>
                  <span className="text-xs text-text-secondary">
                    {conexao ? resumoConexao(conexao) : SEM_CONEXAO[tipo]}
                  </span>
                </div>
                <ConexaoPill conectado={!!conexao} />
                {conexao ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDesconectar(tipo)}
                    aria-label={`Desconectar o ${nome}`}
                    title={`Desconectar o ${nome}`}
                    className="shrink-0 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Unplug className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setAbrindo(abrindo === tipo ? null : tipo)}
                    aria-expanded={abrindo === tipo}
                    className="h-auto shrink-0 px-0"
                  >
                    Como conectar
                  </Button>
                )}
              </div>
              {!conexao && abrindo === tipo && (
                <InstrucoesSoftflow tipo={tipo} endereco={data.enderecoConector} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-text-secondary">
        Pode abrir casos:{" "}
        <strong className="font-semibold text-text-primary">
          {data.podeAbrirCaso ? "Sim" : "Não"}
        </strong>
        . O que cada conexão pode fazer segue o seu perfil no Softflow.
      </p>
    </div>
  );
}
