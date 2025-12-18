import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "bg-indigo-500 hover:bg-indigo-400 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
