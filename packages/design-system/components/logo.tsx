import type { SVGProps } from "react";
import { cn } from "../lib/utils";

type LogoProperties = {
  readonly showName?: boolean;
  readonly className?: string;
};

export const Logomark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    viewBox="0 0 118 118"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Eververse logomark</title>
    <path
      d="M59.3377 117.036C63.1496 117.036 66.2732 114.231 66.8024 110.26C72.0434 74.8953 76.861 69.9718 110.85 66.1073C114.767 65.6308 117.785 62.3486 117.785 58.5368C117.785 54.6717 114.82 51.4954 110.902 50.913C77.1259 46.2012 72.9438 42.0718 66.8024 6.76032C66.1142 2.84261 63.0964 0.036499 59.3377 0.036499C55.4732 0.036499 52.4022 2.84261 51.7671 6.81298C46.632 42.125 41.8144 47.0485 7.87879 50.913C3.85524 51.4427 0.890625 54.619 0.890625 58.5368C0.890625 62.3486 3.7494 65.5249 7.77295 66.1073C41.6022 70.9249 45.7316 75.0012 51.7671 110.313C52.5612 114.284 55.6317 117.036 59.3377 117.036Z"
      fill="currentColor"
    />
  </svg>
);

export const Logo = ({ showName, className }: LogoProperties) => (
  <div className={cn("not-prose flex items-center gap-2", className)}>
    <Logomark className="h-4 text-primary" />
    <p
      className={cn(
        "font-semibold text-foreground text-lg tracking-tight",
        !showName && "sr-only"
      )}
    >
      Eververse
    </p>
  </div>
);
