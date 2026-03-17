/**
 * Renova a sessão via cookie HttpOnly. O token não é exposto ao cliente.
 */
export async function refreshToken(): Promise<{ success: boolean }> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Erro ao renovar sessão");
  }
  return { success: !!data?.success };
}
