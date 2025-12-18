import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../lib/auth";
import { getApiErrorMessage } from "../lib/errors";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      nav("/");
    },
  });

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-xl border border-slate-800 bg-slate-950/40 p-6">
      <h1 className="text-xl font-semibold text-slate-100">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-300">Login to manage your tasks.</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />

        {mutation.isError ? (
          <div className="rounded-md border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">
            {getApiErrorMessage(mutation.error, "Login failed.")}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="mt-4 text-sm text-slate-300">
        Don&apos;t have an account?{" "}
        <Link className="text-indigo-300 hover:text-indigo-200" to="/register">
          Register
        </Link>
      </div>
    </div>
  );
}
