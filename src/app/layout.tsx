import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "HEABIT 2026 — Heavan Bitte Relay & Cheering Competition",
    template: "%s · HEABIT 2026",
  },
  description:
    "HEABIT (Heavan Bitte) 2026 — lomba relay & cheering antar komunitas lari di Heavan 2.0, Kawasan CPI Makassar. Minggu, 6 Desember 2026.",
  openGraph: {
    title: "HEABIT 2026 — Heavan Run Vol. 3",
    description: "Lomba relay & cheering antar komunitas lari. Minggu, 6 Desember 2026 di Heavan 2.0, CPI Makassar.",
    images: ["/img/hero.webp"],
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3385ce",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
