import { type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type NodeStatus = "loading" | "success" | "error" | "initial";
export type NodeStatusVariant = "overlay" | "border";

export type NodeStatusIndicatorProps = {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
};

/** Renders a blurred overlay with a spinning loader */
export const SpinnerLoadingIndicator = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="relative">
      <StatusBorder className="border-blue-700/40">{children}</StatusBorder>

      {/* semi-transparent overlay */}
      <div className="absolute inset-0 z-40 rounded-[7px] bg-background/50 backdrop-blur-sm" />

      {/* centered spinner */}
      <div className="absolute inset-0 z-50">
        <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-blue-700/20" />
        <LoaderCircle className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 animate-spin text-blue-700" />
      </div>
    </div>
  );
};

/** Renders a spinning gradient border */
export const BorderLoadingIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className="relative">
      <style>
        {`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .spinner {
          animation: spin 2s linear infinite;
          position: absolute;
          left: 50%;
          top: 50%;
          width: 140%;
          aspect-ratio: 1;
          transform-origin: center;
        }
      `}
      </style>

      <div
        className={cn(
          "absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] overflow-hidden rounded-md",
          className,
        )}
      >
        <div className="spinner rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,_rgba(42,67,233,0.5)_0deg,_rgba(42,138,246,0)_360deg)]" />
      </div>

      {children}
    </div>
  );
};

/** Basic colored border wrapper used by all variants */
const StatusBorder = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className="relative">
      <div
        className={cn(
          "absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-md border-2",
          className,
        )}
      />
      {children}
    </div>
  );
};

/** Main entry point — decides which visual state to show */
export const NodeStatusIndicator = ({
  status,
  variant = "border",
  children,
  className,
}: NodeStatusIndicatorProps) => {
  switch (status) {
    case "loading":
      if (variant === "overlay") {
        return <SpinnerLoadingIndicator>{children}</SpinnerLoadingIndicator>;
      }
      return (
        <BorderLoadingIndicator className={className}>
          {children}
        </BorderLoadingIndicator>
      );

    case "success":
      return (
        <StatusBorder className={cn("border-emerald-700/50", className)}>
          {children}
        </StatusBorder>
      );

    case "error":
      return (
        <StatusBorder className={cn("border-red-700/50", className)}>
          {children}
        </StatusBorder>
      );

    default:
      return <>{children}</>;
  }
};
