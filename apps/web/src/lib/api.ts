/**
 * Origin of the API server.
 *
 * Empty by default: the app is served from the same origin as `/api`, and in
 * development Vite's proxy forwards `/api` to http://localhost:8000. Set
 * `VITE_API_URL` when the API lives on a different origin. `vite.config.mts`
 * always defines this key, so reading it here is safe even without a .env.
 */
export const API_BASE_URL = process.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * `fetch` for the app's own (non Better Auth) endpoints: sends cookies, parses
 * JSON, and turns non-2xx responses into a thrown `ApiError`.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && typeof payload === "object" && payload !== null
        ? ((payload as { message?: string }).message ??
          (payload as { error?: string }).error)
        : undefined) ?? `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

/** Narrows an unknown thrown value to a human-readable message. */
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
