import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: Props) {
  return (
    <label className="block">
      <span className="text-sm text-slate-200">{label}</span>
      <input
        className={`mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-400">{error}</div> : null}
    </label>
  );
}
