import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-500 ${className}`} {...props} />;
}
