import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "./providers/react-query-provider";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
export const metadata: Metadata = {
  title: "Casos Front",
  description: "Aplicação de casos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
