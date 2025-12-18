import { api } from "./api";
import type { User } from "../types";

export async function listUsers() {
  const { data } = await api.get<{ users: User[] }>("/users");
  return data.users;
}
