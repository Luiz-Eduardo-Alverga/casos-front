/** Dados da pessoa logada mostrados na tela de autorização. */
export interface PessoaAutorizacao {
  nome: string;
  email: string;
  setor: string;
  /** Tem `create-case`: sem ela o Claude só consulta (decisão #5). */
  podeAbrirCaso: boolean;
}

export type EstadoAutorizacao =
  | { tipo: "sem-sessao"; loginHref: string }
  | { tipo: "erro"; motivo: string }
  | {
      tipo: "pedido";
      pessoa: PessoaAutorizacao;
      /** "Claude" ou "Claude Code" (pelo `redirect_uri`, decisão #24). */
      nomeCliente: string;
      /** Parâmetros OAuth da query, reenviados no POST. */
      params: Record<string, string>;
      /** `/login?callbackUrl=...` desta mesma tela, para "Não é você?". */
      loginHref: string;
    };
