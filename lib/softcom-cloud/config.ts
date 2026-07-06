export type SoftcomCloudConfig = {
  baseURL: string;
  apiKey: string;
};

function normalizeSoftcomCloudBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, "");
  if (trimmed.endsWith("/v1")) return trimmed;
  return `${trimmed}/v1`;
}

/**
 * Lê credenciais da API Softcom Cloud (somente servidor).
 * Aceita SOFTCOM_CLOUD_* ou os aliases BASE_URL / API_KEY definidos no .env.
 */
export function getSoftcomCloudConfig(): SoftcomCloudConfig {
  const baseURLRaw = (
    process.env.SOFTCOM_CLOUD_BASE_URL ?? process.env.BASE_URL
  )?.trim();
  const apiKey = (
    process.env.SOFTCOM_CLOUD_API_KEY ?? process.env.API_KEY
  )?.trim();

  if (!baseURLRaw || !apiKey) {
    throw new Error(
      "Configuração ausente: defina SOFTCOM_CLOUD_BASE_URL (ou BASE_URL) e SOFTCOM_CLOUD_API_KEY (ou API_KEY).",
    );
  }

  return {
    baseURL: normalizeSoftcomCloudBaseUrl(baseURLRaw),
    apiKey,
  };
}
