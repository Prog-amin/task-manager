import { useQuery } from "@tanstack/react-query";

import { listNotifications } from "../lib/notifications";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    refetchInterval: 30_000,
  });
}
