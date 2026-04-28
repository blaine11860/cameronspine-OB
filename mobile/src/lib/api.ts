import axios from "axios";

// Point to the Express backend. Update this to your deployed URL or local dev URL.
// For local development: use your machine's LAN IP (e.g. http://192.168.1.x:5000)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
});

export async function apiGet<T>(path: string): Promise<T> {
  const res = await api.get<T>(path);
  return res.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await api.post<T>(path, body);
  return res.data;
}

export async function apiDelete(path: string): Promise<void> {
  await api.delete(path);
}
