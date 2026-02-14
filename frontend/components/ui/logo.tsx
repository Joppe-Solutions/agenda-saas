"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  forceTheme?: "light" | "dark";
}

const sizes = {
  sm: { icon: 20, full: 28 },
  md: { icon: 24, full: 32 },
  lg: { icon: 32, full: 40 },
};

export function Logo({ variant = "full", size = "md", className, forceTheme }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const height = sizes[size][variant];
  
  const isDark = forceTheme ? forceTheme === "dark" : mounted && resolvedTheme === "dark";
  const logoSrc = variant === "icon" 
    ? "/brand/logo-icon.png" 
    : isDark 
      ? "/brand/logo-full-dark.png" 
      : "/brand/logo-full.png";

  if (variant === "icon") {
    return (
      <div className={cn("relative", className)} style={{ width: height, height }}>
        <Image
          src={logoSrc}
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
        src={logoSrc}
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