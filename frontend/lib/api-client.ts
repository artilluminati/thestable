import { clearToken, getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getToken();
    if (token) {
      (finalHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (response.status === 401 && auth) {
    // This was a request that was supposed to carry a valid token and got
    // rejected anyway - the token is missing/expired/invalid, and the
    // backend will keep rejecting it on every retry. Silently leaving the
    // screen stuck with no data (the bug being fixed here) is worse than a
    // hard redirect: force a clean re-login with a clear reason instead.
    // (auth === false requests - i.e. the login/register calls themselves -
    // are deliberately excluded, since a wrong password also returns 401
    // and that must stay an inline form error, not a "session expired".)
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?expired=1";
    }
    throw new Error("Сессия истекла - войдите снова");
  }

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const data = await response.json();
      detail = data.detail ?? detail;
    } catch {
      // response body wasn't JSON - ignore
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
