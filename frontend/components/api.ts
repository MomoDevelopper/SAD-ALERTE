export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    throw new Error(typeof data === "object" && data && "error" in data ? String((data as any).error) : "REQUEST_FAILED");
  }
  return data as T;
}

