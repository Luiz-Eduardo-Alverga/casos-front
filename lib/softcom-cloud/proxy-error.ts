type AxiosLikeError = {
  response?: {
    status?: number;
    data?: { message?: string; error?: string };
  };
  message?: string;
};

export function getSoftcomCloudProxyErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const err = error as AxiosLikeError;
  return (
    err?.response?.data?.error ??
    err?.response?.data?.message ??
    err?.message ??
    fallback
  );
}

export function getSoftcomCloudProxyStatus(error: unknown): number {
  const err = error as AxiosLikeError;
  return err?.response?.status ?? 500;
}

export function softcomCloudProxyErrorResponse(
  error: unknown,
  fallback: string,
): Response {
  const status = getSoftcomCloudProxyStatus(error);
  const errorMessage = getSoftcomCloudProxyErrorMessage(error, fallback);
  console.error(fallback, error);
  return Response.json({ error: errorMessage }, { status });
}
