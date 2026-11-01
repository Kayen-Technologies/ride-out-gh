/**
 * A tiny blurred copy of a picture as a data URL (about 16 px wide, a few hundred bytes). Shown instantly
 * while the real picture loads. Runs in the browser, at upload time; returns null if it cannot be made
 * (the picture then simply gets the plain shimmer).
 */
export async function blurFromBlob(blob: Blob): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(blob);
    const width = 16;
    const height = Math.max(1, Math.round((bitmap.height / bitmap.width) * width));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const url = canvas.toDataURL("image/webp", 0.4);
    return url.startsWith("data:image/") && url.length < 2000 ? url : null;
  } catch {
    return null;
  }
}
