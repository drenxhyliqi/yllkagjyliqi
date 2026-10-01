/** Longest side kept when uploading; the server keeps the same. */
const MAX_EDGE = 2400;

/**
 * Shrinks a phone photo in the browser before upload, so a 10 MB original
 * becomes about 1 MB on a mobile connection. Falls back to the original file
 * when the browser can't decode it; the server checks it either way.
 */
export async function shrinkPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const small = file.size < 2_000_000 && ["image/jpeg", "image/webp"].includes(file.type);
    if (scale === 1 && small) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
