import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { temPermissao, type ConectorSession } from "@/lib/api-db/with-conector-permission";
import { comTokenDaConexao } from "@/lib/conector-claude/legacy-token";
import { abrirCaso, erroDaApi, prepararCaso } from "./caso";
import { consultarCaso, SECOES_CONSULTA } from "./consulta";
import {
  filtrarPorBusca,
  listarCategorias,
  listarImportancias,
  listarModulos,
  listarOrigens,
  listarPessoas,
  listarProdutos,
  listarProjetos,
  listarVersoes,
  TIPOS_OPCAO,
  type Opcao,
} from "./catalogos";

const MAX_OPCOES = 15;

const texto = (t: string, isError = false) => ({
  content: [{ type: "text" as const, text: t }],
  ...(isError ? { isError: true } : {}),
});

const semPermissao = (acao: string) =>
  texto(`Seu perfil no Softflow não permite ${acao}.`, true);

const idSchema = z.union([z.string(), z.number()]).transform((v) => String(v).trim());

const INSTRUCOES = [
  "Conector do Softflow, o sistema de casos da Softcom. Use o vocabulário do produto: caso (nunca ticket), produto, versão, projeto, dev atribuído.",
  "Para abrir um caso: 1) descubra os IDs pelo nome com softflow_buscar_opcoes; 2) chame softflow_preparar_caso; 3) mostre a prévia à pessoa e pergunte se pode abrir; 4) só com a confirmação, chame softflow_abrir_caso com o código da prévia.",
  "Nunca abra um caso sem a pessoa confirmar a prévia. Se houver dois resultados com o mesmo nome, pergunte qual é.",
  "Para planejar uma funcionalidade ou escrever o texto de um caso, use a skill xp-planejar do catálogo do Brainiac: se as ferramentas do Brainiac estiverem na conversa, leia-a com brainiac_skills_list (vault \"engenharia\", busca \"xp-planejar\") e brainiac_skill_read antes de começar, e siga o passo 7 dela para abrir o caso. Se o Brainiac não estiver conectado, avise a pessoa uma vez que o planejamento fica sem o contexto dos produtos e que ela pode conectá-lo (o endereço está no Softflow, menu do usuário → Claude). Abrir um caso já planejado não depende do Brainiac.",
  "Para implementar, testar ou revisar um caso, chame softflow_consultar_caso com o número antes de começar: ela traz descrição, anotações, clientes, relações e anexos.",
].join("\n");

/** Servidor MCP de uma requisição, com as ferramentas fechadas sobre a conexão da pessoa. */
export function criarServidorMcp(session: ConectorSession): McpServer {
  const server = new McpServer(
    { name: "softflow", title: "Softflow", version: "1.0.0" },
    { instructions: INSTRUCOES },
  );
  const { appUser, permissions } = session;
  const podeAbrir = temPermissao(permissions, "create-case");

  server.registerTool(
    "softflow_eu",
    {
      title: "Quem sou eu no Softflow",
      description:
        "Mostra a pessoa conectada (nome, registro, setor), se ela pode abrir casos e os projetos do setor dela, para sugerir o projeto padrão.",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const projetos = await comTokenDaConexao(session.conexao, (auth) =>
          listarProjetos(auth, appUser.legacyUserId, { setor: appUser.setor }),
        );
        return texto(
          [
            `Pessoa: ${appUser.nome} (registro ${appUser.legacyUserId}), setor ${appUser.setor}.`,
            `Pode abrir casos: ${podeAbrir ? "sim" : "não (só consulta)"}.`,
            "Contexto dos produtos: conecte também o Brainiac e use a skill xp-planejar do catálogo dele.",
            "",
            `Projetos do setor ${appUser.setor}:`,
            ...(projetos.length
              ? projetos.slice(0, MAX_OPCOES).map((p) => `- ${p.nome} (${p.id})${p.detalhe ? `, ${p.detalhe}` : ""}`)
              : ["- nenhum"]),
          ].join("\n"),
        );
      } catch (error) {
        return texto(`Não foi possível consultar seus dados: ${erroDaApi(error, "erro")}.`, true);
      }
    },
  );

  server.registerTool(
    "softflow_buscar_opcoes",
    {
      title: "Buscar opções do Softflow",
      description:
        "Busca até 15 opções (id e nome) de um catálogo usado na abertura de caso: produto, versao, modulo, projeto, pessoa, categoria, importancia ou origem. Versão e módulo exigem produto_id.",
      inputSchema: {
        tipo: z.enum(TIPOS_OPCAO).describe("Catálogo a consultar"),
        busca: z.string().optional().describe("Parte do nome (sem acento, sem caixa)"),
        produto_id: idSchema.optional().describe("Obrigatório em versao e modulo; em projeto, filtra pelo setor do produto"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ tipo, busca, produto_id }) => {
      if ((tipo === "versao" || tipo === "modulo") && !produto_id) {
        return texto(`Informe produto_id para buscar ${tipo}.`, true);
      }
      try {
        const opcoes: Opcao[] = await comTokenDaConexao(session.conexao, async (auth) => {
          switch (tipo) {
            case "produto":
              return filtrarPorBusca(await listarProdutos(auth), busca);
            case "versao":
              return filtrarPorBusca(await listarVersoes(auth, produto_id!), busca);
            case "modulo":
              return filtrarPorBusca(await listarModulos(auth, produto_id!), busca);
            case "projeto": {
              const setor = produto_id
                ? (await listarProdutos(auth)).find((p) => p.id === produto_id)?.setor
                : undefined;
              return filtrarPorBusca(
                await listarProjetos(auth, appUser.legacyUserId, { setor }),
                busca,
              );
            }
            case "pessoa":
              return filtrarPorBusca(await listarPessoas(auth), busca);
            case "categoria":
              return filtrarPorBusca(await listarCategorias(auth), busca);
            case "importancia":
              return filtrarPorBusca(await listarImportancias(auth), busca);
            case "origem":
              return filtrarPorBusca(await listarOrigens(auth), busca);
          }
        });
        if (!opcoes.length) {
          return texto(`Nenhuma opção de ${tipo}${busca ? ` com "${busca}"` : ""}.`);
        }
        const mostradas = opcoes.slice(0, MAX_OPCOES);
        const linhas = mostradas.map(
          (o) => `- ${o.nome} (${o.id})${o.detalhe ? `, ${o.detalhe}` : ""}`,
        );
        if (opcoes.length > MAX_OPCOES) {
          linhas.push(`(mais ${opcoes.length - MAX_OPCOES}; refine a busca)`);
        }
        return texto(`Opções de ${tipo}:\n${linhas.join("\n")}`);
      } catch (error) {
        return texto(`Não foi possível buscar ${tipo}: ${erroDaApi(error, "erro")}.`, true);
      }
    },
  );

  server.registerTool(
    "softflow_preparar_caso",
    {
      title: "Preparar prévia de caso",
      description:
        "Resolve e valida os campos de um caso novo, aplica os padrões da tela (importância 3, categoria 4, origem 4, relator = a pessoa conectada) e devolve a prévia com um código. Não cria nada. Mostre a prévia à pessoa antes de abrir.",
      inputSchema: {
        produto_id: idSchema.describe("ID do produto"),
        versao: idSchema.describe("Versão: id (sequência) de softflow_buscar_opcoes ou o texto exato"),
        projeto_id: idSchema.describe("ID do projeto"),
        dev_id: idSchema.describe("ID da pessoa dev atribuída"),
        resumo: z.string().describe("Resumo (título) do caso"),
        descricao: z.string().describe("Descrição completa do caso"),
        importancia: idSchema.optional().describe("Nível de importância (padrão 3)"),
        categoria_id: idSchema.optional().describe("ID da categoria (padrão 4)"),
        origem_id: idSchema.optional().describe("ID da origem (padrão 4)"),
        relator_id: idSchema.optional().describe("ID do relator (padrão: a pessoa conectada)"),
        modulo: z.string().optional().describe("Nome do módulo do produto"),
        qa_id: idSchema.optional().describe("ID da pessoa de QA"),
        informacoes_adicionais: z.string().optional(),
        nao_planejado: z.boolean().optional().describe("Caso não planejado (padrão false); só ele gera DM no Discord"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (input) => {
      if (!podeAbrir) return semPermissao("abrir casos");
      try {
        const { texto: t } = await prepararCaso(session, input);
        return texto(t);
      } catch (error) {
        return texto(`Não foi possível preparar a prévia: ${erroDaApi(error, "erro")}.`, true);
      }
    },
  );

  server.registerTool(
    "softflow_abrir_caso",
    {
      title: "Abrir caso no Softflow",
      description:
        "Cria o caso exatamente como na prévia, pelo código devolvido por softflow_preparar_caso. Só chame depois de a pessoa confirmar a prévia no chat. Repetir o mesmo código devolve o mesmo caso, sem criar outro.",
      inputSchema: {
        codigo_previa: z.string().describe("Código da prévia (pv_...)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ codigo_previa }) => {
      if (!podeAbrir) return semPermissao("abrir casos");
      try {
        return texto(await abrirCaso(session, codigo_previa));
      } catch (error) {
        return texto(`Não foi possível abrir o caso: ${erroDaApi(error, "erro")}.`, true);
      }
    },
  );

  server.registerTool(
    "softflow_consultar_caso",
    {
      title: "Consultar caso",
      description:
        "Caso completo pelo número, para implementar, testar ou revisar: produto, versão, projeto, status, dev, QA e link, e em seções Markdown a descrição (com passos, informações adicionais e história), as anotações (30 mais recentes), os clientes, as relações e os anexos com link de download que vence em 5 minutos. Use `secoes` para pedir só parte quando o caso for grande.",
      inputSchema: {
        registro: idSchema.describe("Número do caso"),
        secoes: z
          .array(z.enum(SECOES_CONSULTA))
          .optional()
          .describe(
            "Seções além do cabeçalho: descricao, anotacoes, clientes, relacoes, anexos. Padrão: todas.",
          ),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ registro, secoes }) => {
      if (!temPermissao(permissions, "list-case")) return semPermissao("consultar casos");
      return texto(await consultarCaso(session, registro, secoes));
    },
  );

  return server;
}
