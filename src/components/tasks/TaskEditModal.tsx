import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { Task, TaskPriority, TaskStatus } from "../../types";
import { useUsers } from "../../hooks/useUsers";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select } from "../Select";

const schema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  dueDateDate: z.string().min(1),
  dueDateTime: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]),
  assignedToId: z.string().optional(),
});

function toIsoFromLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (values: {
    title: string;
    description?: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId?: string | null;
  }) => void;
  submitting?: boolean;
};

export function TaskEditModal({ open, task, onClose, onSubmit, submitting }: Props) {
  const usersQuery = useUsers();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      dueDateDate: "",
      dueDateTime: "",
      priority: "MEDIUM",
      status: "TODO",
      assignedToId: "",
    },
  });

  useEffect(() => {
    if (!task) return;
    const d = new Date(task.dueDate);
    const yyyyMmDd = d.toISOString().slice(0, 10);
    const hhMm = d.toISOString().slice(11, 16);
    form.reset({
      title: task.title,
      description: task.description ?? "",
      dueDateDate: yyyyMmDd,
      dueDateTime: hhMm,
      priority: task.priority,
      status: task.status,
      assignedToId: task.assignedToId ?? "",
    });
  }, [task, form]);

  if (!open || !task) return null;

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

  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...(usersQuery.data ?? []).map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-slate-100">Edit task</div>
            <div className="mt-1 text-sm text-slate-300">{task.id}</div>
          </div>
          <button
            type="button"
            className="text-sm text-slate-300 hover:text-slate-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={form.handleSubmit((values) => {
            const nextAssignedToId = values.assignedToId ? values.assignedToId : null;
            const prevAssignedToId = task.assignedToId ?? null;

            const payload: Parameters<Props["onSubmit"]>[0] = {
              title: values.title,
              description: values.description ?? "",
              dueDate: toIsoFromLocalDateTime(values.dueDateDate, values.dueDateTime),
              priority: values.priority,
              status: values.status,
            };

            if (nextAssignedToId !== prevAssignedToId) {
              payload.assignedToId = nextAssignedToId;
            }

            onSubmit(payload);
          })}
        >
          <Input label="Title" {...form.register("title")} error={form.formState.errors.title?.message} />
          <Input
            label="Description"
            {...form.register("description")}
            error={form.formState.errors.description?.message}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Due date"
              type="date"
              {...form.register("dueDateDate")}
              error={form.formState.errors.dueDateDate?.message}
            />
            <Input
              label="Due time"
              type="time"
              {...form.register("dueDateTime")}
              error={form.formState.errors.dueDateTime?.message}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Priority" options={priorities} {...form.register("priority")} />
            <Select label="Status" options={statuses} {...form.register("status")} />
          </div>
          <Select
            label="Assignee (creator only)"
            options={assigneeOptions}
            disabled={usersQuery.isLoading || usersQuery.isError}
            {...form.register("assignedToId")}
          />

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
