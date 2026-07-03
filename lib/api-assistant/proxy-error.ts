type AxiosLikeError = {
  response?: {
    status?: number;
    data?: { message?: string; error?: string; success?: boolean };
  };
  message?: string;
};

export function getAssistantProxyErrorMessage(
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

export function getAssistantProxyStatus(error: unknown): number {
  const err = error as AxiosLikeError;
  return err?.response?.status ?? 500;
}

export function assistantProxyErrorResponse(
  error: unknown,
  fallback: string,
): Response {
  const status = getAssistantProxyStatus(error);
  const errorMessage = getAssistantProxyErrorMessage(error, fallback);
  console.error(fallback, error);
  return Response.json({ success: false, error: errorMessage }, { status });
}
