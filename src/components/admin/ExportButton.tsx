"use client";

import { useState } from "react";
import { Spinner } from "@/components/Spinner";

export function ExportButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch("/admin/export");
          if (!res.ok) throw new Error();
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `peserta-heabit-2026-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } catch {
          window.location.href = "/admin/export";
        } finally {
          setBusy(false);
        }
      }}
      className="btn-ghost py-2 text-xs lg:ml-auto"
    >
      {busy ? <Spinner /> : "⤓"} {busy ? "Menyiapkan…" : "Export CSV"}
    </button>
  );
}
