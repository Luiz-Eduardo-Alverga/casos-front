import { Login } from "@/components/login/login";
import { PublicRoute } from "@/components/public-route";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const callbackUrl =
    typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;

  return (
    <PublicRoute callbackUrl={callbackUrl}>
      <Login callbackUrl={callbackUrl} />
    </PublicRoute>
  );
}
