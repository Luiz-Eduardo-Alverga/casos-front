import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import {
  getLegacyUserFromToken,
  LegacyAuthMeError,
} from "@/lib/legacy-auth/me";
import { legacyUserSchema } from "@/lib/validators/db/legacy-user";
import type { IniciarProducaoData } from "@/services/projeto-casos-producao/iniciar-producao";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";

interface CasoAbertoApiBody {
  success?: boolean;
  data?: IniciarProducaoData;
}

interface ProjetoMemoriaApiBody {
  success?: boolean;
  data?: ProjetoMemoriaItem;
}

export async function GET() {
  try {
    const authHeaders = await getAuthorizationHeader();
    const authorization = authHeaders.Authorization;
    if (!authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const bearerHeaders = { Authorization: authorization };

    let legacyRaw: unknown;
    try {
      legacyRaw = await getLegacyUserFromToken(bearerHeaders);
    } catch (e) {
      if (e instanceof LegacyAuthMeError) {
        return Response.json({ error: e.message }, { status: e.statusCode });
      }
      throw e;
    }

    const parsedUser = legacyUserSchema.safeParse(legacyRaw);
    if (!parsedUser.success) {
      return Response.json(
        { error: "Usuário autenticado inválido" },
        { status: 502 },
      );
    }

    const usuarioId = parsedUser.data.id;

    let casoAbertoRes: { data: CasoAbertoApiBody };
    try {
      casoAbertoRes = await api.get(
        `/projeto-casos-producao/caso-aberto/${usuarioId}`,
        { headers: bearerHeaders },
      );
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 404) {
        return Response.json({ hasCasoAberto: false });
      }
      throw error;
    }

    const producao = casoAbertoRes.data?.data;
    if (!producao?.em_andamento) {
      return Response.json({ hasCasoAberto: false });
    }

    const registro = producao.registro;
    let caso: ProjetoMemoriaItem | null = null;

    try {
      const memoriaRes = await api.get<ProjetoMemoriaApiBody>(
        `/projeto-memoria/${registro}`,
        { headers: bearerHeaders },
      );
      caso = memoriaRes.data?.data ?? null;
    } catch (memoriaError: unknown) {
      console.error(
        "Erro ao buscar projeto-memoria no caso-aberto-ativo:",
        memoriaError,
      );
    }

    return Response.json({
      hasCasoAberto: true,
      producao,
      caso,
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    console.error("Erro na API Route caso-aberto-ativo:", error);

    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      "Erro ao buscar caso aberto ativo";

    return Response.json({ error: errorMessage }, { status });
  }
}
