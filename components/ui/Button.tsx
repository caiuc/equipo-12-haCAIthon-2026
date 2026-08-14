import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Provisional primitive. Calculator tabs must never hand-roll a styled
 * <button> — restyling the app should mean editing this file only.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent-strong text-white hover:bg-[#164a8c] shadow-card",
  secondary: "bg-surface text-ink border border-line hover:border-accent hover:bg-accent-soft",
  ghost: "bg-transparent text-ink-secondary hover:bg-surface-muted hover:text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-lg font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
