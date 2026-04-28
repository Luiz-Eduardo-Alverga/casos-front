import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "./providers/react-query-provider";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme/theme-provider";
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
