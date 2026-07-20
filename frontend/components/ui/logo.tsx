import LogoSvg from "../../public/logo.svg";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Logo = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
        <LogoSvg
            ref={ref}
            viewBox="0 0 80 70"
            className={cn("h-7 w-7 text-current", className)}
            {...props}
        />
    ),
);
Logo.displayName = "Logo";
