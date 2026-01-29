import { useMutation } from "@tanstack/react-query";
import { login as loginService } from "@/services/auth/login";

export function useLogin() {
    return useMutation({
        mutationFn: ({ usuario, senha }: { usuario: string, senha: string }) => loginService({ usuario, senha }),
    });
}