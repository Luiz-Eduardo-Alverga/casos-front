"use client";

import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, X, ChevronDown, User, Camera } from "lucide-react";
import { getUser, clearAuthData } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUserAvatarUrl } from "@/hooks/use-user-avatar";
import { AlterarFotoPerfilModal } from "@/components/header/alterar-foto-perfil-modal";

export function UserDropDown() {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = getUser();
  const { data: avatarData } = useUserAvatarUrl(!!user);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearAuthData();
    toast.success("Logout realizado com sucesso", {
      position: "top-right",
    });
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.nome);
  const avatarUrl = avatarData?.avatarUrl ?? null;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-all">
            <div className="bg-bg-accent-start border border-border-accent rounded-full p-px">
              <Avatar className="size-8">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={user.nome} />
                ) : null}
                <AvatarFallback className="bg-muted text-text-label">
                  <User className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
            </div>

            <span className="text-sm font-medium text-text-label sr-only lg:not-sr-only">
              {user.nome}
            </span>

            <ChevronDown className="sr-only sm:not-sr-only sm:h-4 sm:w-4 text-text-label" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent asChild className="p-0" align="end" forceMount>
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-card border border-border shadow-2xl rounded-lg overflow-hidden z-[400] animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="p-0">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-primary/10 dark:to-primary/5 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-border shadow-md">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={user.nome} />
                        ) : null}
                        <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">
                          {user.nome}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user.usuario}
                        </p>
                        {user.setor && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.setor}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 hover:bg-muted/50"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* <Separator className="my-2" /> */}

                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setAvatarModalOpen(true);
                    }}
                    className="cursor-pointer w-full flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Alterar foto de perfil
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Enviar uma nova imagem
                      </div>
                    </div>
                  </button>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer w-full flex items-center gap-4 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Sair</div>
                      <div className="text-xs text-red-500 dark:text-red-400">
                        Desconectar da conta
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlterarFotoPerfilModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        userName={user.nome}
      />
    </>
  );
}
