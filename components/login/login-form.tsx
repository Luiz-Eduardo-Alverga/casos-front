"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
}

export function LoginForm({
  onSubmit,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
}: LoginFormProps) {
  const { register, formState } = useFormContext<LoginFormData>();
  const { isSubmitting, errors } = formState;
  return (
    <div className="flex w-full max-w-[360px] flex-col items-center">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-16 w-[195px] shrink-0">
            <Image
              src="/images/softflow.svg"
              alt="Softflow"
              width={195}
              height={48}
              className="object-contain"
            />
          </div>
          <p className="text-center text-base font-medium leading-snug text-white">
            Simples, intuitivo e fácil de usar!
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium leading-none text-white"
              >
                E-mail
              </Label>
              <div className="relative h-10">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-login-placeholder" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  className="h-10 rounded border-login-input-border text-base bg-white pl-9 pr-3 text-foreground placeholder:text-login-placeholder focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("email")}
                />
              </div>
              {errors.email?.message && (
                <p className="text-sm text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium leading-none text-white"
              >
                Senha
              </Label>
              <div className="relative h-10">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-login-placeholder" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua Senha"
                  className="h-10 rounded border-login-input-border bg-white pl-9 pr-9 text-base text-foreground placeholder:text-login-placeholder focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-login-placeholder transition-colors "
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-sm text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="h-4 w-4 shrink-0 border-white"
              />
              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-semibold leading-none text-login-checkbox-label"
              >
                Lembrar de mim
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 w-full bg-login-button-gradient px-5 py-2.5 text-sm font-medium text-login-button-text hover:opacity-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-3">
          <div className="h-px w-full bg-white/20" />
          <p className="text-center text-sm font-normal leading-tight text-login-footer-text">
            © 2026 Softflow. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
