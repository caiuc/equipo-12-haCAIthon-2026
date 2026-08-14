import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FinPath AI",
  description: "Simulador educativo de crédito, deuda e inversión para Chile.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
