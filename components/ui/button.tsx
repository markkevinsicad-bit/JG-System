import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eng-blue focus-visible:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-eng-blue text-white hover:bg-[#1a52ba] shadow-sm hover:shadow-md active:scale-[0.98]",
        secondary:
          "bg-white text-navy border border-gray-border hover:bg-gray-light active:scale-[0.98]",
        ghost: "text-navy hover:bg-gray-light active:scale-[0.98]",
        destructive:
          "bg-red text-white hover:bg-[#c02222] active:scale-[0.98]",
        outline:
          "border border-eng-blue text-eng-blue hover:bg-eng-blue-light active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
