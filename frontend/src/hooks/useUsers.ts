import { useQuery } from "@tanstack/react-query";

import { listUsers } from "../lib/usersList";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    staleTime: 60_000,
  });
}
