import { api } from "./api";
import type { User } from "../types";

export async function register(input: { email: string; password: string; name: string }) {
  const { data } = await api.post<{ user: User }>("/auth/register", input);
  return data.user;
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<{ user: User }>("/auth/login", input);
  return data.user;
}

export async function logout() {
  const { data } = await api.post<{ ok: boolean }>("/auth/logout");
  return data.ok;
}
