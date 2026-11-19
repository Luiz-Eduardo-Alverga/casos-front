"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAuthData } from "@/lib/auth";
import { useAutorizarConector } from "@/hooks/conector-claude/use-autorizar-conector";
import { AutorizarConectorError } from "@/services/conector-claude/autorizar";
import { AutorizarCabecalho } from "./autorizar-cabecalho";
import { AutorizarErro } from "./autorizar-erro";
import { AutorizarLayout } from "./autorizar-layout";
import { AutorizarSemSessao } from "./autorizar-sem-sessao";
import { PermissoesLista } from "./permissoes-lista";
import { autorizarFormSchema, type AutorizarFormData } from "./schema";
import type { EstadoAutorizacao, PessoaAutorizacao } from "./autorizar.types";
import { iniciaisDoNome } from "./utils";

/** Tela "Conectar o Claude ao Softflow" (`/oauth/autorizar`). */
export function AutorizarConector({ estado }: { estado: EstadoAutorizacao }) {
  if (estado.tipo === "sem-sessao") {
    return <AutorizarSemSessao loginHref={estado.loginHref} />;
  }
  return (
    <AutorizarLayout>
      {estado.tipo === "erro" ? (
        <AutorizarErro motivo={estado.motivo} />
      ) : (
        <AutorizarPedido
          pessoa={estado.pessoa}
          params={estado.params}
          loginHref={estado.loginHref}
        />
      )}
    </AutorizarLayout>
  );
}

function AutorizarPedido({
  pessoa,
  params,
  loginHref,
}: {
  pessoa: PessoaAutorizacao;
  params: Record<string, string>;
  loginHref: string;
}) {
  const router = useRouter();
  const mutation = useAutorizarConector();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroPedido, setErroPedido] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<
    "permitir" | "cancelar" | null
  >(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AutorizarFormData>({
    resolver: zodResolver(autorizarFormSchema),
    defaultValues: { senha: "" },
  });

  const ocupado = acaoEmAndamento !== null;

  async function enviar(acao: "permitir" | "cancelar", senha?: string) {
    setErroGeral(null);
    setAcaoEmAndamento(acao);
    try {
      const { redirectTo } = await mutation.mutateAsync({ params, acao, senha });
      // Volta ao Claude (endereço já validado no servidor contra a lista permitida).
      window.location.assign(redirectTo);
    } catch (error) {
      setAcaoEmAndamento(null);
      if (error instanceof AutorizarConectorError) {
        if (error.status === 422) {
          setError("senha", { message: error.message });
          return;
        }
        if (error.status === 400) {
          setErroPedido(error.message);
          return;
        }
        setErroGeral(error.message);
        return;
      }
      setErroGeral("Não foi possível conectar. Tente de novo.");
    }
  }

  async function trocarDeConta() {
    clearAuthData();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace(loginHref);
  }

  if (erroPedido) return <AutorizarErro motivo={erroPedido} />;

  return (
    <form
      onSubmit={handleSubmit((data) => enviar("permitir", data.senha))}
      className="flex flex-col gap-6"
    >
      <AutorizarCabecalho />

      <div className="flex items-center gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-sm font-semibold text-primary-foreground"
          aria-hidden
        >
          {iniciaisDoNome(pessoa.nome)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary-foreground">
            {pessoa.nome}
          </p>
          <p className="truncate text-xs text-primary-foreground/60">
            {pessoa.email}
            {pessoa.setor ? ` · ${pessoa.setor}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={trocarDeConta}
          disabled={ocupado}
          className="shrink-0 text-xs font-medium text-brand-yellow hover:underline disabled:opacity-50"
        >
          Não é você?
          <span className="sr-only"> Entrar com outra conta</span>
        </button>
      </div>

      <PermissoesLista podeAbrirCaso={pessoa.podeAbrirCaso} />

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="senha"
          className="text-sm font-medium leading-none text-primary-foreground"
        >
          Senha do Softflow
        </Label>
        <div className="relative h-10">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-login-placeholder" />
          <Input
            id="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Confirme sua senha"
            disabled={ocupado}
            aria-invalid={!!errors.senha}
            className="h-10 rounded border-login-input-border bg-card pl-9 pr-9 text-base text-foreground placeholder:text-login-placeholder focus-visible:ring-1 focus-visible:ring-ring"
            {...register("senha")}
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-login-placeholder"
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.senha?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.senha.message}
          </p>
        ) : (
          <p className="text-xs text-primary-foreground/60">
            Usada só para criar o acesso do Claude. O Softflow não guarda sua
            senha.
          </p>
        )}
      </div>

      {erroGeral && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 p-2 text-sm text-destructive"
        >
          {erroGeral}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={ocupado}
          onClick={() => enviar("cancelar")}
          className="h-10 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          {acaoEmAndamento === "cancelar" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Cancelar"
          )}
        </Button>
        <Button
          type="submit"
          disabled={ocupado}
          className="h-10 bg-login-button-gradient text-sm font-medium text-login-button-text hover:opacity-95"
        >
          {acaoEmAndamento === "permitir" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Conectando...</span>
            </>
          ) : (
            "Permitir acesso"
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-primary-foreground/60">
        Você pode desconectar quando quiser pelo menu do seu usuário no Softflow.
      </p>
    </form>
  );
}
