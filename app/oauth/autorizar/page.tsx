import type { Metadata } from "next";
import { AutorizarConector } from "@/components/conector-claude/autorizar";
import type { EstadoAutorizacao } from "@/components/conector-claude/autorizar/autorizar.types";
import { getTokenFromCookie } from "@/lib/auth-server";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import { NOME_TIPO_CLIENTE, tipoClienteDoRedirect } from "@/lib/conector-claude/config";
import { validarPedidoAutorizacao } from "@/lib/conector-claude/pedido-autorizacao";
import { LegacyAuthMeError } from "@/lib/legacy-auth/me";
import { OAUTH_AUTORIZAR_PATH } from "@/lib/safe-callback-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conectar o Claude",
  description: "Conectar o Claude ao Softflow",
  robots: { index: false, follow: false },
};

function primeiroValor(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AutorizarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const valor = primeiroValor(v);
    if (valor !== undefined) params[k] = valor;
  }

  const selfPath = `${OAUTH_AUTORIZAR_PATH}?${new URLSearchParams(params).toString()}`;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(selfPath)}`;

  const estado = await resolverEstado(params, loginHref);
  return <AutorizarConector estado={estado} />;
}

async function resolverEstado(
  params: Record<string, string>,
  loginHref: string,
): Promise<EstadoAutorizacao> {
  // Pedido inválido não depende de login: mostra o erro direto, sem redirecionar (decisão #4).
  const validado = await validarPedidoAutorizacao(params);
  if (!validado.ok) return { tipo: "erro", motivo: validado.motivo };

  const token = await getTokenFromCookie();
  if (!token) return { tipo: "sem-sessao", loginHref };

  try {
    const { appUser, permissions } = await syncAppUserAndPermissions({
      Authorization: `Bearer ${token}`,
    });
    return {
      tipo: "pedido",
      params,
      nomeCliente: NOME_TIPO_CLIENTE[tipoClienteDoRedirect(validado.pedido.redirect_uri)],
      loginHref,
      pessoa: {
        nome: appUser.nome,
        email: appUser.email,
        setor: appUser.setor,
        podeAbrirCaso: permissions.includes("create-case"),
      },
    };
  } catch (error) {
    if (error instanceof LegacyAuthMeError && error.statusCode === 401) {
      return { tipo: "sem-sessao", loginHref };
    }
    console.error("[conector-claude] Falha ao carregar a tela de autorização:", error);
    return {
      tipo: "erro",
      motivo: "Não foi possível carregar seus dados no Softflow.",
    };
  }
}
