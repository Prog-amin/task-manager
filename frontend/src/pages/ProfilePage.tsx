import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useMe } from "../hooks/useMe";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { updateMe } from "../lib/users";
import { getApiErrorMessage } from "../lib/errors";

const schema = z.object({
  name: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const me = useMe();
  const qc = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { name: me.data?.name ?? "" },
  });

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Profile</h1>
        <p className="mt-1 text-sm text-slate-300">Update your display name.</p>
      </div>

      <form
        className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Input
          label="Name"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />

        {mutation.isSuccess ? (
          <div className="text-sm text-emerald-300">Saved.</div>
        ) : null}

        {mutation.isError ? (
          <div className="text-sm text-rose-300">
            {getApiErrorMessage(mutation.error, "Update failed.")}
          </div>
        ) : null}

        <Button type="submit" disabled={mutation.isPending || me.isLoading}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
}
