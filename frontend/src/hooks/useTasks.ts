import { useQuery } from "@tanstack/react-query";

import { api } from "../lib/api";
import type { Task, TaskPriority, TaskStatus } from "../types";

export function useTasks(filters: {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortDueDate?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const { data } = await api.get<{ tasks: Task[] }>("/tasks", {
        params: filters,
      });
      return data.tasks;
    },
  });
}
