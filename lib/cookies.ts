const TOKEN_COOKIE = process.env.NEXT_PUBLIC_AUTH_TOKEN_COOKIE || "auth_token";
const TENANT_COOKIE = process.env.NEXT_PUBLIC_TENANT_COOKIE || "tenant_context";

const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function cookieOptions(maxAge = MAX_AGE): string {
  const parts = [
    `path=/`,
    `max-age=${maxAge}`,
    `samesite=lax`,
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("secure");
  }

  return parts.join("; ");
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : undefined;
}

function writeCookie(name: string, value: string, maxAge = MAX_AGE) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions(maxAge)}`;
}

function expireCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; path=/; max-age=0`;
}

export function getAuthToken(): string | undefined {
  return readCookie(TOKEN_COOKIE);
}

export function setAuthToken(token: string) {
  writeCookie(TOKEN_COOKIE, token);
}

export function clearAuthToken() {
  expireCookie(TOKEN_COOKIE);
}

export function getTenantContext(): string | undefined {
  return readCookie(TENANT_COOKIE);
}

export function setTenantContext(tenantId: string) {
  writeCookie(TENANT_COOKIE, tenantId);
}

export function clearTenantContext() {
  expireCookie(TENANT_COOKIE);
}
