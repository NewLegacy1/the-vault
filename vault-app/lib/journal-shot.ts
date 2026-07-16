/** Compress an image file to a JPEG data URL under maxBytes (default ~350KB). */
export async function compressChartShot(file: File, maxBytes = 350_000): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxW = 1280;
  const scale = bitmap.width > maxW ? maxW / bitmap.width : 1;
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > maxBytes * 1.37 && quality > 0.35) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > maxBytes * 1.37) {
    throw new Error("Snapshot still too large after compress — crop or use a smaller PNG/JPG.");
  }
  return dataUrl;
}
