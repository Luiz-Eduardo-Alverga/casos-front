"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useLogin } from "@/hooks/use-login";
import { saveAuthData } from "@/lib/auth";
import { LoginBanner } from "./login-banner";
import { LoginForm, type LoginFormData } from "./login-form";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const REMEMBER_ME_KEY = "@casos:rememberMe";
const REMEMBERED_EMAIL_KEY = "@casos:rememberedEmail";

export function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { handleSubmit, setValue } = methods;

  const { mutateAsync } = useLogin();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const shouldRemember = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    if (shouldRemember && rememberedEmail) {
      setValue("email", rememberedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await mutateAsync({
        usuario: data.email,
        senha: data.password,
      });

      if (response.success && response.user) {
        saveAuthData({ user: response.user });

        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, "true");
          localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }

        router.push("/painel");
      }
    } catch (error) {
      toast.error("Credenciais inválidas");
      console.error(error);
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="grid h-screen min-h-screen w-full grid-cols-1 overflow-hidden bg-primary lg:grid-cols-2">
        <aside className="hidden h-full lg:block">
          <LoginBanner />
        </aside>
        <main className="flex min-h-0 flex-col overflow-auto px-4 py-6 lg:px-[159px] lg:py-12">
          <div className="flex flex-1 items-center justify-center">
            <LoginForm
              onSubmit={handleSubmit(onSubmit)}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
            />
          </div>
          <footer className="shrink-0 pb-6 pt-4 lg:pb-8 lg:pt-6">
            <div className="flex justify-center">
              <Image
                src="/images/logo2.svg"
                alt=""
                width={150}
                height={48}
                className="object-contain"
              />
            </div>
          </footer>
        </main>
      </div>
    </FormProvider>
  );
}
