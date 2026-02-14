import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        destructive:
          "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background text-foreground",
        success:
          "bg-[#DCFCE7] text-[#14532D] dark:bg-[#14532D] dark:text-[#BBF7D0]",
        warning:
          "bg-[#FEF3C7] text-[#7C2D12] dark:bg-[#78350F] dark:text-[#FDE68A]",
        info:
          "bg-[#DBEAFE] text-[#0C4A6E] dark:bg-[#1E3A5F] dark:text-[#93C5FD]",
        danger:
          "bg-[#FEE2E2] text-[#7F1D1D] dark:bg-[#7F1D1D] dark:text-[#FECACA]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
