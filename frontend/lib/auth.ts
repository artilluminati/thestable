// Simple cookie-based token storage. A plain (non-httpOnly) cookie is used
// on purpose: middleware.ts (edge runtime) needs to read the token to
// protect /dashboard, and the backend lives on a different origin in dev.
// For a real deployment behind one domain, switch this to an httpOnly
// cookie set directly by the backend on login.
const TOKEN_KEY = "pp_token";

export function setToken(token: string) {
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}
