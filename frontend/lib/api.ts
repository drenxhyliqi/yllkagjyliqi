import "server-only";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/** An error response from the API. `status` is 0 when the API could not be reached. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
  /** Admin session token, sent as a bearer token. */
  token?: string;
};

/** Server-side request to the FastAPI backend. Throws ApiError on failure. */
export async function apiFetch<T>(
  path: string,
  { json, token, headers, ...init }: ApiOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      ...init,
      headers: {
        Accept: "application/json",
        ...(json !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: json === undefined ? undefined : JSON.stringify(json),
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
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
