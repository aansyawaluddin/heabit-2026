const MESSAGES: Record<string, string> = {
  PENDAFTARAN_DITUTUP: "Pendaftaran sedang ditutup oleh panitia.",
  KUOTA_PENUH: "Maaf, kuota komunitas sudah penuh.",
  NAMA_KOMUNITAS_SUDAH_TERDAFTAR: "Nama komunitas ini sudah terdaftar. Hubungi panitia jika ini keliru.",
  JUMLAH_PESERTA_TIDAK_VALID: "Jumlah peserta harus 7 orang (5 utama + 2 cadangan).",
  KOMPOSISI_PESERTA_TIDAK_VALID: "Komposisi harus 3 putra, 2 putri, 1 cadangan putra, dan 1 cadangan putri.",
  JUMLAH_CHEERING_TIDAK_VALID: "Jumlah anggota cheering harus antara 1 dan 200.",
  FOTO_TIDAK_DITEMUKAN: "Ada foto peserta yang gagal terunggah. Silakan coba kirim lagi.",
  DATA_TIDAK_VALID: "Ada data yang belum sesuai. Periksa kembali nama dan nomor WhatsApp.",
  FORBIDDEN: "Akses ditolak. Akun ini bukan admin.",
  TIM_BELUM_DISETUJUI: "Tim harus berstatus disetujui sebelum diundi.",
  TIM_TIDAK_LOLOS_KUALIFIKASI: "Tim ini belum tercatat lolos kualifikasi (peringkat 1–3).",
  TIM_SUDAH_DIUNDI: "Tim ini sudah masuk bagan pada tahap ini.",
  SLOT_PENUH: "Semua slot pada tahap ini sudah terisi.",
  TAHAP_TIDAK_VALID: "Tahap undian tidak dikenal.",
};

export function friendlyError(message?: string | null) {
  if (!message) return "Terjadi kesalahan. Silakan coba lagi.";
  const key = Object.keys(MESSAGES).find((k) => message.includes(k));
  return key ? MESSAGES[key] : message;
}
