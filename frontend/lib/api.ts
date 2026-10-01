import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/** An error response from the API. `status` is 0 when the API could not be reached. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** For validation errors: the first field the API rejected. */
    readonly field?: string,
    /** A machine-readable reason, when the API gives one. */
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
  /** Multipart body, e.g. a photo upload. */
  form?: FormData;
  /** Admin session token, sent as a bearer token. */
  token?: string;
};

/** Server-side request to the FastAPI backend. Throws ApiError on failure. */
export async function apiFetch<T>(
  path: string,
  { json, form, token, headers, ...init }: ApiOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(form ? 60_000 : 10_000),
      ...init,
      headers: {
        Accept: "application/json",
        ...(json !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: form ?? (json === undefined ? undefined : JSON.stringify(json)),
    });
  } catch {
    throw new ApiError(0, "The server could not be reached.");
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : response.statusText;
    const errors = body && typeof body === "object" && "errors" in body ? body.errors : null;
    const field =
      Array.isArray(errors) && typeof errors[0]?.field === "string" ? errors[0].field : undefined;
    const code =
      body && typeof body === "object" && "code" in body && typeof body.code === "string"
        ? body.code
        : undefined;
    throw new ApiError(response.status, message, field, code);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
