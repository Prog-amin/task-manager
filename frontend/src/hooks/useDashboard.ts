import { useQuery } from "@tanstack/react-query";

import { dashboard } from "../lib/tasks";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboard,
  });
}
