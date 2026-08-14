import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Provisional primitive. Calculator tabs must never hand-roll a styled
 * <button> — restyling the app should mean editing this file only.
 *
 * The arcade chrome (notched corners, moulded bands, press-onto-shadow) all
 * comes from `.px .px-btn` in app/globals.css; the variants below only pick a
 * tone and the text color that clears 4.5:1 against it.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  // pixel-magenta fills with #c22986, the magenta step that holds white text.
  primary: "pixel pixel-btn pixel-magenta text-white",
  secondary: "pixel pixel-btn pixel-white text-ink",
  ghost: "pixel pixel-btn pixel-cream text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[10px] gap-2",
  md: "h-11 px-5 text-[11px] gap-2.5",
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
        "pixel-focus inline-flex items-center justify-center font-pixel uppercase leading-none",
        "transition-transform duration-75",
        "disabled:cursor-not-allowed",
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
