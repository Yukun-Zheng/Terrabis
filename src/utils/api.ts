export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(url, options);
  if (!resp.ok) throw new Error(`请求失败: ${resp.status}`);
  return resp.json();
} 