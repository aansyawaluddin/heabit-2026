"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Peserta", match: (p: string) => p === "/admin" || p.startsWith("/admin/tim") },
  { href: "/admin/undian", label: "Undian & Bagan", match: (p: string) => p.startsWith("/admin/undian") },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${i.match(path) ? "bg-white text-brand-navy" : "text-white/80 hover:bg-white/10"}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
