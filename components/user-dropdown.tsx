"use client";

import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { LogOut, X } from "lucide-react";
import { getUser, clearAuthData } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const AVATAR_URL = "https://43eba7a9e7b2ca5208818e2171a13420.cdn.bubble.io/f1738958025870x407176369407359800/user%20avatar%201.svg";

export function UserDropDown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    clearAuthData();
    toast.success("Logout realizado com sucesso", {
      position: "top-right",
    });
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  // Obter iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg transition-all">
          <Image
            src={AVATAR_URL}
            alt={user.nome || "avatar"}
            width={40}
            height={40}
            className="cursor-pointer rounded-full overflow-hidden hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all duration-200"
            unoptimized
          />
          <div className="flex flex-col items-start">
          <span className="hidden sm:inline text-sm font-medium text-foreground">
            {user.nome}
          </span>
            <span className="text-xs text-muted-foreground">
              {user.usuario}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        asChild
        className="p-0"
        align="end"
        forceMount
      >
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 shadow-2xl rounded-lg overflow-hidden z-[400] animate-in fade-in-0 zoom-in-95 duration-200"
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="p-0">
              {/* User Profile Section */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
                      <AvatarImage src={AVATAR_URL} alt={user.nome} />
                      <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                        {getInitials(user.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {user.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.usuario}
                      </p>
                      {user.setor && (
                        <p className="text-xs text-gray-500 mt-1">
                          {user.setor}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-white/50"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Separator className="my-2" />

              {/* Logout Button */}
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full flex items-center gap-4 p-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600 hover:text-red-700"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Sair</div>
                    <div className="text-xs text-red-500">
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
  );
}
