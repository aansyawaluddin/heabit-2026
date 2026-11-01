import type { GroupCode, Stage } from "./types";

export const EVENT = {
  name: "HEABIT 2026",
  longName: "HEABIT (Heavan Bitte) Relay & Cheering Competition",
  edition: "Heavan Run Vol. 3",
  dateLabel: "Minggu, 6 Desember 2026",
  dateISO: "2026-12-06T04:00:00+08:00",
  time: "04.00 – 10.00 WITA",
  schedule: [
    { time: "04.00 – 06.00", label: "Persiapan & registrasi ulang" },
    { time: "06.00 – 10.00", label: "Pelaksanaan lomba relay & cheering" },
  ],
  venue: "Heavan 2.0 / Heavan Experience",
  address: "Jl. CitraLand Boulevard No. 20, Kawasan CPI, Makassar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Heavan+2.0+Heavan+Experience+CPI+Makassar",
  instagram: "heavanwithyou",
  contacts: [
    { name: "Bayu", phone: "6283131634915", label: "+62 831-3163-4915" },
    { name: "Rahmat Rece", phone: "6285735622208", label: "+62 857-3562-2208" },
  ],
  hashtags: ["#KeseruanDiAkhirTahun", "#AlwaysWithYou", "#CeritaAkhirTahun", "#BakuBitte"],
  routeKm: "±0,96 km",
};

export const PRIZES = {
  total: "Rp10.500.000",
  categories: [
    { name: "Relay", prizes: ["Rp2.500.000", "Rp2.000.000", "Rp1.500.000"] },
    { name: "Cheering", prizes: ["Rp2.000.000", "Rp1.500.000", "Rp1.000.000"] },
  ],
};

/** Komposisi wajib per komunitas */
export const ROSTER = [
  { key: "L-utama-1", gender: "L", role: "utama", slot: 1, label: "Pelari Putra 1" },
  { key: "L-utama-2", gender: "L", role: "utama", slot: 2, label: "Pelari Putra 2" },
  { key: "L-utama-3", gender: "L", role: "utama", slot: 3, label: "Pelari Putra 3" },
  { key: "P-utama-1", gender: "P", role: "utama", slot: 1, label: "Pelari Putri 1" },
  { key: "P-utama-2", gender: "P", role: "utama", slot: 2, label: "Pelari Putri 2" },
  { key: "L-cadangan-1", gender: "L", role: "cadangan", slot: 1, label: "Cadangan Putra" },
  { key: "P-cadangan-1", gender: "P", role: "cadangan", slot: 1, label: "Cadangan Putri" },
] as const;

export type RosterKey = (typeof ROSTER)[number]["key"];

export const STAGES: { id: Stage; label: string; groups: GroupCode[]; capacity: number }[] = [
  { id: "kualifikasi", label: "Kualifikasi", groups: ["A", "B", "C"], capacity: 5 },
  { id: "semifinal", label: "Semifinal", groups: ["S1", "S2", "S3"], capacity: 3 },
  { id: "final", label: "Final", groups: ["F"], capacity: 3 },
];

export const GROUP_LABEL: Record<GroupCode, string> = {
  A: "Match 1",
  B: "Match 2",
  C: "Match 3",
  S1: "Semifinal 1",
  S2: "Semifinal 2",
  S3: "Semifinal 3",
  F: "Final",
};

export function rosterLabel(p: { gender: string; role: string; slot: number }) {
  return ROSTER.find((r) => r.gender === p.gender && r.role === p.role && r.slot === p.slot)?.label ?? "Peserta";
}

export function waLink(phone: string, text?: string) {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${phone}${q}`;
}
