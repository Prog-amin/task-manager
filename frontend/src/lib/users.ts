import { api } from "./api";
import type { User } from "../types";

export async function updateMe(input: { name: string }) {
  const { data } = await api.patch<{ user: User }>("/users/me", input);
  return data.user;
}
