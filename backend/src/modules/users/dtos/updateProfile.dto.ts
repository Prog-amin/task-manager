import { z } from "zod";

export const updateProfileDto = z.object({
  name: z.string().min(1).max(100),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
