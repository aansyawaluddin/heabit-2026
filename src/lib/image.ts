/** Mengecilkan foto di browser sebelum diunggah (maks 1200px, JPEG). */
export async function compressImage(file: File, maxSide = 1200, quality = 0.85): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("FORMAT_FOTO");
  }
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("FORMAT_FOTO");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("FORMAT_FOTO"))), "image/jpeg", quality),
  );
}

export function normalizePhone(raw: string) {
  let v = raw.replace(/[^0-9]/g, "");
  if (v.startsWith("0")) v = "62" + v.slice(1);
  if (v.startsWith("8")) v = "62" + v;
  return v;
}
