import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API interna /api/db (Swagger)",
  description:
    "Documentação OpenAPI 3.1 dos endpoints Postgres (Drizzle) — respostas envelopadas.",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        href="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui.css"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
