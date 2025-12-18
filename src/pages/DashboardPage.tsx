import { useMemo, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";

import { useMe } from "../hooks/useMe";
import { useTasks } from "../hooks/useTasks";
import { useDashboard } from "../hooks/useDashboard";
import { useNotifications } from "../hooks/useNotifications";
import { useUsers } from "../hooks/useUsers";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Skeleton } from "../components/Skeleton";
import { Textarea } from "../components/Textarea";
import type { TaskPriority, TaskStatus } from "../types";
import { createTask, deleteTask, updateTask } from "../lib/tasks";
import { getSocket } from "../lib/socket";
import { TaskEditModal } from "../components/tasks/TaskEditModal";
import { getApiErrorMessage } from "../lib/errors";

const priorities: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const statuses: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
];

type CreateTaskFormValues = {
  title: string;
  description?: string;
  dueDateDate: string;
  dueDateTime: string;
  priority: TaskPriority;
  assignedToId?: string;
};

const createTaskSchema: z.ZodType<CreateTaskFormValues> = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  dueDateDate: z.string().min(1),
  dueDateTime: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assignedToId: z.string().optional(),
});

function toIsoFromLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

const createTaskResolver: Resolver<CreateTaskFormValues> = async (values) => {
  const parsed = createTaskSchema.safeParse(values);
  if (parsed.success) {
    return { values: parsed.data, errors: {} };
  }

  const fieldErrors = parsed.error.flatten().fieldErrors;
  const errors: Record<string, any> = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (message) {
      errors[key] = { type: "validation", message };
    }
  }

  return { values: {}, errors };
};

export function DashboardPage() {
  const qc = useQueryClient();
  const me = useMe();
  const dashboardQuery = useDashboard();
  const usersQuery = useUsers();

  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [sortDueDate, setSortDueDate] = useState<"asc" | "desc">("asc");

  const tasksQuery = useTasks({
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    sortDueDate,
  });

  const notificationsQuery = useNotifications();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const createForm = useForm<CreateTaskFormValues>({
    resolver: createTaskResolver,
    defaultValues: {
      title: "",
      description: "",
      dueDateDate: "",
      dueDateTime: "",
      priority: "MEDIUM",
      assignedToId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      createForm.reset({
        title: "",
        description: "",
        dueDateDate: "",
        dueDateTime: "",
        priority: "MEDIUM",
        assignedToId: "",
      });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTask(id, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      await qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  useEffect(() => {
    const socket = getSocket();

    const invalidateTasks = () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    };

    socket.on("task:created", invalidateTasks);
    socket.on("task:updated", invalidateTasks);
    socket.on("task:deleted", invalidateTasks);
    socket.on("notification", () => qc.invalidateQueries({ queryKey: ["notifications"] }));

    return () => {
      socket.off("task:created", invalidateTasks);
      socket.off("task:updated", invalidateTasks);
      socket.off("task:deleted", invalidateTasks);
      socket.off("notification");
    };
  }, [qc]);

  const unreadCount = useMemo(() => {
    const list = notificationsQuery.data ?? [];
    return list.filter((n) => !n.readAt).length;
  }, [notificationsQuery.data]);

  const assigneeOptions = useMemo(() => {
    return [
      { value: "", label: "Unassigned" },
      ...(usersQuery.data ?? []).map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
    ];
  }, [usersQuery.data]);

  const editingTask = useMemo(() => {
    if (!editingTaskId) return null;
    return (tasksQuery.data ?? []).find((t) => t.id === editingTaskId) ?? null;
  }, [editingTaskId, tasksQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-300">
            {me.data ? `Signed in as ${me.data.email}` : "Loading profile..."}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">
          <div className="text-sm text-slate-200">Notifications</div>
          <div className="mt-1 text-2xl font-semibold text-slate-100">{unreadCount}</div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {["Assigned to me", "Created by me", "Overdue"].map((title) => (
          <div
            key={title}
            className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
          >
            <div className="text-sm font-semibold text-slate-100">{title}</div>
            <div className="mt-3 space-y-2">
              {dashboardQuery.isLoading ? <Skeleton className="h-16" /> : null}

              {dashboardQuery.isSuccess
                ? (title === "Assigned to me"
                    ? dashboardQuery.data.assignedToMe
                    : title === "Created by me"
                      ? dashboardQuery.data.createdByMe
                      : dashboardQuery.data.overdue
                  ).slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditingTaskId(t.id)}
                      className="block w-full rounded-lg border border-slate-800 bg-slate-900/30 p-3 text-left hover:bg-slate-900/50"
                    >
                      <div className="text-sm text-slate-100 line-clamp-1">{t.title}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        Due: {new Date(t.dueDate).toLocaleString()}
                      </div>
                    </button>
                  ))
                : null}

              {dashboardQuery.isSuccess &&
              (title === "Assigned to me"
                ? dashboardQuery.data.assignedToMe.length
                : title === "Created by me"
                  ? dashboardQuery.data.createdByMe.length
                  : dashboardQuery.data.overdue.length) === 0 ? (
                <div className="text-sm text-slate-300">No tasks.</div>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Create task</h2>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={createForm.handleSubmit((values) =>
            createMutation.mutate({
              title: values.title,
              description: values.description ?? "",
              dueDate: toIsoFromLocalDateTime(values.dueDateDate, values.dueDateTime),
              priority: values.priority,
              status: "TODO",
              ...(values.assignedToId ? { assignedToId: values.assignedToId } : {}),
            }),
          )}
        >
          <Input
            label="Title"
            {...createForm.register("title")}
            error={createForm.formState.errors.title?.message}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Due date"
              type="date"
              {...createForm.register("dueDateDate")}
              error={createForm.formState.errors.dueDateDate?.message}
            />
            <Input
              label="Due time"
              type="time"
              {...createForm.register("dueDateTime")}
              error={createForm.formState.errors.dueDateTime?.message}
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              rows={4}
              {...createForm.register("description")}
              error={createForm.formState.errors.description?.message}
            />
          </div>
          <Select
            label="Priority"
            options={priorities}
            {...createForm.register("priority")}
          />
          <Select
            label="Assignee"
            options={assigneeOptions}
            disabled={usersQuery.isLoading || usersQuery.isError}
            {...createForm.register("assignedToId")}
          />

          {createMutation.isError ? (
            <div className="md:col-span-2 rounded-md border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
              {getApiErrorMessage(createMutation.error, "Failed to create task.")}
            </div>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Tasks</h2>
            <p className="text-sm text-slate-300">Filter, sort, and update tasks.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[{ value: "", label: "All" }, ...statuses]}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[{ value: "", label: "All" }, ...priorities]}
            />
            <Select
              label="Sort due"
              value={sortDueDate}
              onChange={(e) => setSortDueDate(e.target.value as any)}
              options={[
                { value: "asc", label: "Earliest" },
                { value: "desc", label: "Latest" },
              ]}
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {tasksQuery.isLoading ? (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          ) : null}

          {tasksQuery.data?.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/30 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-100">{t.title}</div>
                <div className="mt-1 text-xs text-slate-300">
                  Due: {new Date(t.dueDate).toLocaleString()} | Priority: {t.priority} | Status: {t.status}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setEditingTaskId(t.id)}>
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    updateMutation.mutate({
                      id: t.id,
                      data: { status: t.status === "COMPLETED" ? "TODO" : "COMPLETED" },
                    })
                  }
                  disabled={updateMutation.isPending}
                >
                  Toggle done
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteMutation.mutate(t.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {tasksQuery.isSuccess && (tasksQuery.data?.length ?? 0) === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/20 p-6 text-sm text-slate-300">
              No tasks found.
            </div>
          ) : null}
        </div>
      </section>

      <TaskEditModal
        open={!!editingTaskId}
        task={editingTask}
        onClose={() => setEditingTaskId(null)}
        submitting={updateMutation.isPending}
        onSubmit={(values) => {
          if (!editingTaskId) return;
          updateMutation.mutate({ id: editingTaskId, data: values });
          setEditingTaskId(null);
        }}
      />
    </div>
  );
}
