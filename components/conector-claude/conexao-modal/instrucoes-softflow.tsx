import type { TipoClienteConexao } from "@/services/conector-claude/conexao";
import { EnderecoCopiavel } from "./endereco-copiavel";
import { PassosNumerados, type Passo } from "./passos-numerados";
import { comandoClaudeCode } from "./utils";

const PASSO_SENHA: Passo = {
  texto: (
    <>
      Confira seus dados no Softflow, digite sua senha e clique em{" "}
      <strong>Permitir acesso</strong>.
    </>
  ),
};

/**
 * Passo a passo para conectar o Softflow num tipo de cliente (decisão #25), com o que copiar
 * dentro do passo que o usa (decisão #26).
 */
export function InstrucoesSoftflow({
  tipo,
  endereco,
}: {
  tipo: TipoClienteConexao;
  endereco: string;
}) {
  if (tipo === "claude-code") {
    return (
      <PassosNumerados
        passos={[
          {
            texto: "No terminal, rode o comando:",
            bloco: (
              <>
                <EnderecoCopiavel
                  valor={comandoClaudeCode(endereco)}
                  ariaLabel="Copiar comando do Claude Code"
                />
                <p className="text-xs text-text-secondary">
                  Adicione{" "}
                  <strong className="font-semibold text-text-primary">--scope user</strong>{" "}
                  para valer em todos os projetos.
                </p>
              </>
            ),
          },
          {
            texto: (
              <>
                No Claude Code, digite <strong>/mcp</strong>, escolha{" "}
                <strong>softflow</strong> e <strong>Authenticate</strong>.
              </>
            ),
          },
          PASSO_SENHA,
        ]}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <PassosNumerados
        passos={[
          {
            texto: (
              <>
                No Claude, abra <strong>Customize → Connectors</strong> e clique em{" "}
                <strong>Add custom connector</strong>.
              </>
            ),
          },
          {
            texto: (
              <>
                Cole o endereço e clique em <strong>Add</strong>:
              </>
            ),
            bloco: (
              <EnderecoCopiavel valor={endereco} ariaLabel="Copiar endereço do Softflow" />
            ),
          },
          PASSO_SENHA,
        ]}
      />
      <p className="text-xs text-text-secondary">
        Funciona em contas Pro e Max. No plano Free, o Claude aceita só um conector
        personalizado.
      </p>
    </div>
  );
}
