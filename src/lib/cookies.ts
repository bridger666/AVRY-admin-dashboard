export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(
  name: string,
  value: string,
  options: { maxAge?: number; path?: string; httpOnly?: boolean } = {}
): void {
  if (typeof document === "undefined") return;
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.maxAge) cookie += `; max-age=${options.maxAge}`;
  cookie += `; path=${options.path ?? "/"}`;
  cookie += "; SameSite=Lax";
  document.cookie = cookie;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; path=/`;
}
