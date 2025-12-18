import { Link, Outlet, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../../lib/auth";
import { useMe } from "../../hooks/useMe";
import { Button } from "../Button";
import { NotificationsPanel } from "../notifications/NotificationsPanel";

export function AppShell() {
  const me = useMe();
  const qc = useQueryClient();
  const nav = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await qc.invalidateQueries();
      nav("/login");
    },
  });

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-800 bg-slate-950/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-100">
            Task Manager
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="text-sm text-slate-200 hover:text-slate-100"
            >
              Profile
            </Link>
            <NotificationsPanel />
            {me.data ? (
              <div className="text-sm text-slate-200">{me.data.name}</div>
            ) : null}
            <Button
              variant="secondary"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
