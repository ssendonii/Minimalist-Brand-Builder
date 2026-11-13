export async function safeFetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, init);
  const rawBody = await res.text();

  if (!rawBody) {
    if (!res.ok) {
      throw new Error(`Server returned an empty error response (HTTP ${res.status}).`);
    }
    return { ok: res.ok, status: res.status, data: {} as T };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    const normalized = rawBody.trim().toLowerCase();
    if (normalized.startsWith('<!doctype') || normalized.startsWith('<html')) {
      throw new Error(
        `Connection or gateway timeout while reaching the server (HTTP ${res.status}). Please retry in a moment.`
      );
    }
    throw new Error(
      `Received a non-JSON response from the server (HTTP ${res.status}). Please retry.`
    );
  }

  return { ok: res.ok, status: res.status, data: parsed as T };
}
