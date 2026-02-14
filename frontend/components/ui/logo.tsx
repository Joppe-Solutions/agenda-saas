import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 20, full: 28 },
  md: { icon: 24, full: 32 },
  lg: { icon: 32, full: 40 },
};

export function Logo({ variant = "full", size = "md", className }: LogoProps) {
  const height = sizes[size][variant];

  if (variant === "icon") {
    return (
      <div className={cn("relative", className)} style={{ width: height, height }}>
        <Image
          src="/brand/logo-icon.png"
          alt="reserva.online"
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} style={{ width: height * 3.5, height }}>
      <Image
        src="/brand/logo-full.png"
        alt="reserva.online"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

export function LogoLink({ variant = "full", size = "md", className, href = "/" }: LogoProps & { href?: string }) {
  return (
    <a href={href} className={cn("flex items-center", className)}>
      <Logo variant={variant} size={size} />
    </a>
  );
}
