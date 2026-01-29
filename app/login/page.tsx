import { Login } from "@/components/login";
import { PublicRoute } from "@/components/public-route";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login",
};  

export default function LoginPage() {
  return (
    <PublicRoute>
      <Login />
    </PublicRoute>
  );
}
