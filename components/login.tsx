"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/use-login";
import { saveAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { useState, useEffect } from "react";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

type LoginFormData = z.infer<typeof loginSchema>;

const REMEMBER_ME_KEY = '@casos:rememberMe';
const REMEMBERED_EMAIL_KEY = '@casos:rememberedEmail';

export function Login() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    
    const { register, handleSubmit, formState: { isSubmitting }, setValue } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const { mutateAsync } = useLogin();

    // Carregar email salvo quando o componente montar
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
            const shouldRemember = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
            
            if (shouldRemember && rememberedEmail) {
                setValue('email', rememberedEmail);
                setRememberMe(true);
            }
        }
    }, [setValue]);

    async function onSubmit(data: LoginFormData) {
        try {
            const response = await mutateAsync({
                usuario: data.email,
                senha: data.password,
            });
            
            // Salvar token e dados do usuário no localStorage
            if (response.success && response.authorization && response.user) {
                saveAuthData({
                    authorization: response.authorization,
                    user: response.user,
                });
                
                // Salvar email se "lembrar de mim" estiver marcado
                if (rememberMe) {
                    localStorage.setItem(REMEMBER_ME_KEY, 'true');
                    localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email);
                } else {
                    localStorage.removeItem(REMEMBER_ME_KEY);
                    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                }
                
                // Redirecionar para a página de casos
                router.push("/casos");
            }
        } catch (error) {
            toast.error("Credenciais inválidas");
            console.error(error);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Company Branding */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Softcasos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Realize a abertura de casos com Inteligência Artificial</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl">Entrar</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Digite suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="desenvolvedor@empresa.com"
                    className="pl-10 text-sm sm:text-base"
                    {...register("email")}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 text-sm sm:text-base"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="rememberMe" className="text-sm sm:text-base cursor-pointer">
                  Lembrar de mim
                </Label>
              </div>

              
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 px-4 sm:px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full h-10 sm:h-11"
                disabled={isSubmitting}
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
              
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6">
            <Image
              src="/images/logo.svg"
              alt="Softcasos"
              width={200}
              height={200}
              className="mx-auto"
            />
        </div>
      </div>
    </div>
    );
}