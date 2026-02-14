import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline";
}

function variantClass(variant: ButtonProps["variant"]): string {
  if (variant === "secondary") return "bg-brand-100 text-brand-700 hover:bg-brand-50";
  if (variant === "outline") return "border border-brand-500 bg-white text-brand-700 hover:bg-brand-50";
  return "bg-brand-500 text-white hover:bg-brand-700";
}

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${variantClass(variant)} ${className}`}
      {...props}
    />
  );
}
