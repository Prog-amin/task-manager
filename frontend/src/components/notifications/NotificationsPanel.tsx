import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useNotifications } from "../../hooks/useNotifications";
import { markNotificationRead } from "../../lib/notifications";
import { getApiErrorMessage } from "../../lib/errors";
import { Button } from "../Button";

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const q = useNotifications();

  const unreadCount = useMemo(() => {
    const list = q.data ?? [];
    return list.filter((n) => !n.readAt).length;
  }, [q.data]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900/60"
        onClick={() => setOpen((v) => !v)}
      >
        Notifications
        {unreadCount > 0 ? (
          <span className="ml-2 rounded-full bg-indigo-500 px-2 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-100">Notifications</div>
            <button
              type="button"
              className="text-xs text-slate-300 hover:text-slate-100"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {q.isLoading ? (
              <div className="text-sm text-slate-300">Loading...</div>
            ) : null}

            {markReadMutation.isError ? (
              <div className="rounded-md border border-rose-900 bg-rose-950/40 p-2 text-xs text-rose-200">
                {getApiErrorMessage(markReadMutation.error, "Failed to mark read.")}
              </div>
            ) : null}

            {q.data?.map((n) => (
              <div
                key={n.id}
                className="rounded-lg border border-slate-800 bg-slate-900/30 p-3"
              >
                <div className="text-sm text-slate-100">{n.message}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {new Date(n.createdAt).toLocaleString()}
                  {n.readAt ? " • Read" : " • Unread"}
                </div>

                {!n.readAt ? (
                  <div className="mt-2">
                    <Button
                      variant="secondary"
                      onClick={() => markReadMutation.mutate(n.id)}
                      disabled={markReadMutation.isPending}
                    >
                      Mark read
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}

            {q.isSuccess && (q.data?.length ?? 0) === 0 ? (
              <div className="text-sm text-slate-300">No notifications.</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
