import { authHeaders, getApiKey } from "./auth";

const BASE = "/api";

export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function postJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function postJsonBody<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function putJsonBody<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function deleteJson(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export async function uploadFile(path: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(
    `${BASE}/files/upload?path=${encodeURIComponent(path)}`,
    {
      method: "POST",
      headers: authHeaders(),
      body: form,
    },
  );
  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export function downloadUrl(path: string): string {
  const key = getApiKey();
  const tokenParam = key ? `&token=${encodeURIComponent(key)}` : "";
  return `${BASE}/files/download?path=${encodeURIComponent(path)}${tokenParam}`;
}

export class AuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthError";
  }
}

export async function verifyApiKey(key: string): Promise<boolean> {
  const res = await fetch(`${BASE}/auth/verify`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  return res.ok;
}
