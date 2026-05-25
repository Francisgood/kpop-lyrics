export type AegyoErrorCode = `AA-${string}-${string}`;

export function apiError(
  code: AegyoErrorCode,
  message: string,
  status: number,
  detail?: string
) {
  const body: Record<string, unknown> = { ok: false, error: { code, message } };
  if (process.env.NODE_ENV !== "production" && detail) {
    body.error = { ...(body.error as object), detail };
  }
  return Response.json(body, { status });
}

export function apiOk(data: unknown, status = 200) {
  return Response.json({ ok: true, data }, { status });
}
