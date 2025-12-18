import { z } from "zod";

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]);

export const createTaskDto = z.object({
  title: z.string().min(1).max(100),
  description: z.string().default(""),
  dueDate: z.string().datetime(),
  priority: taskPrioritySchema,
  status: taskStatusSchema.default("TODO"),
  assignedToId: z.string().min(1).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskDto>;

export const updateTaskDto = z
  .object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    assignedToId: z.string().min(1).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export type UpdateTaskDto = z.infer<typeof updateTaskDto>;

export const listTasksQueryDto = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  sortDueDate: z.enum(["asc", "desc"]).optional(),
});

export type ListTasksQueryDto = z.infer<typeof listTasksQueryDto>;
