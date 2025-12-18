import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import type { User } from "../types";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<{ user: User }>("/users/me");
      return data.user;
    },
    staleTime: 30_000,
  });
}
