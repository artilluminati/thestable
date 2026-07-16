import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[200px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 font-mono text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
