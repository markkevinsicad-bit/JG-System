import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-gray-border bg-white px-3 text-sm text-navy placeholder:text-gray-400 transition-colors focus:border-eng-blue focus:outline-none focus:ring-2 focus:ring-eng-blue/20 disabled:bg-gray-light disabled:text-gray-400",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-1.5 block text-sm font-medium text-navy", className)} {...props} />
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-gray-border bg-white px-3 text-sm text-navy transition-colors focus:border-eng-blue focus:outline-none focus:ring-2 focus:ring-eng-blue/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-gray-border bg-white px-3 py-2 text-sm text-navy placeholder:text-gray-400 transition-colors focus:border-eng-blue focus:outline-none focus:ring-2 focus:ring-eng-blue/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
