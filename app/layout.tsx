import type { Metadata } from "next";
import { Nunito, Press_Start_2P, VT323 } from "next/font/google";

import "./globals.css";

/*
 * Three faces, three jobs — see the `fontFamily` block in tailwind.config.ts.
 * All are self-hosted by next/font at build time, so there is no render-blocking
 * request to Google and no layout shift.
 *
 * The `latin` subset covers U+0000-00FF, which carries every accented character
 * Spanish needs (á é í ó ú ñ ¿ ¡). Do not narrow it further.
 */
const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

const score = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-score",
  display: "swap",
});

const sans = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinPath AI",
  description: "Simulador educativo de crédito, deuda e inversión para Chile.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${pixel.variable} ${score.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
