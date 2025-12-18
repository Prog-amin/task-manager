import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, className = "", ...props }: Props) {
  return (
    <label className="block">
      <span className="text-sm text-slate-200">{label}</span>
      <textarea
        className={`mt-1 w-full resize-y rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-400">{error}</div> : null}
    </label>
  );
}
