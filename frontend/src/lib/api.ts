const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
/** Browser: empty → fetch `/api/...` on the web origin (Next rewrites to backend). SSR: absolute backend URL. */
const API = typeof window === 'undefined' ? API_ORIGIN : '';

/** Avoid rendering Cloudflare/HTML error pages as user-visible error text. */
function messageFromFailedResponse(status: number, body: string): string {
  const trimmed = body.trim();
  const looksLikeHtml =
    trimmed.startsWith('<!') ||
    trimmed.startsWith('<html') ||
    /<html[\s>]/i.test(trimmed) ||
    trimmed.includes('<!DOCTYPE');

  if (!looksLikeHtml) {
    try {
      const j = JSON.parse(trimmed) as { message?: unknown; error?: unknown };
      if (typeof j.message === 'string') return j.message;
      if (typeof j.error === 'string') return j.error;
    } catch {
      /* not JSON */
    }
    if (trimmed.length > 0 && trimmed.length <= 500 && !trimmed.includes('<')) {
      return trimmed;
    }
  }

  if (status === 520 || status === 502 || status === 503 || status === 504) {
    return 'The API could not be reached (server or proxy error). Check that the backend is running and healthy, then try again.';
  }
  return `Request failed (${status}). Please try again.`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('afristore_access');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('afristore_access', access);
  localStorage.setItem('afristore_refresh', refresh);
}

export function clearTokens() {
  localStorage.removeItem('afristore_access');
  localStorage.removeItem('afristore_refresh');
}

async function refreshAccess(): Promise<string | null> {
  const refresh = typeof window !== 'undefined' ? localStorage.getItem('afristore_refresh') : null;
  if (!refresh) return null;
  const res = await fetch(`${API}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const url = path.startsWith('http') ? path : `${API}${path}`;
  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && options.auth !== false) {
    const newTok = await refreshAccess();
    if (newTok) {
      headers.set('Authorization', `Bearer ${newTok}`);
      res = await fetch(url, { ...options, headers });
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(messageFromFailedResponse(res.status, errText) || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiBase = API_ORIGIN;

/** Multipart upload (does not set Content-Type — browser sets boundary). */
export async function uploadProductImage(storeId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const path = `/api/products/store/${storeId}/upload`;
  const url = path.startsWith('http') ? path : `${API}${path}`;
  let res = await fetch(url, { method: 'POST', body: form, headers });
  if (res.status === 401) {
    const newTok = await refreshAccess();
    if (newTok) {
      headers.set('Authorization', `Bearer ${newTok}`);
      res = await fetch(url, { method: 'POST', body: form, headers });
    }
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(messageFromFailedResponse(res.status, errText) || res.statusText);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function uploadStoreLogo(storeId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const path = `/api/stores/${storeId}/upload-logo`;
  const url = path.startsWith('http') ? path : `${API}${path}`;
  let res = await fetch(url, { method: 'POST', body: form, headers });
  if (res.status === 401) {
    const newTok = await refreshAccess();
    if (newTok) {
      headers.set('Authorization', `Bearer ${newTok}`);
      res = await fetch(url, { method: 'POST', body: form, headers });
    }
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(messageFromFailedResponse(res.status, errText) || res.statusText);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function uploadStoreHeroImage(storeId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const path = `/api/stores/${storeId}/upload-hero`;
  const url = path.startsWith('http') ? path : `${API}${path}`;
  let res = await fetch(url, { method: 'POST', body: form, headers });
  if (res.status === 401) {
    const newTok = await refreshAccess();
    if (newTok) {
      headers.set('Authorization', `Bearer ${newTok}`);
      res = await fetch(url, { method: 'POST', body: form, headers });
    }
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(messageFromFailedResponse(res.status, errText) || res.statusText);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
