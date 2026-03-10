import { getToken, saveToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  authorization: {
    token: string;
    type: string;
  };
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  const token = getToken();

  const response = await fetchWithAuth("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.error || "Erro ao renovar token";
    throw new Error(errorMessage);
  }

  if (data?.success && data?.authorization?.token) {
    saveToken(data.authorization.token);
  }

  return data as RefreshTokenResponse;
}
