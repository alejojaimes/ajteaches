const MAX_DIMENSION = 2000;
const SIZE_THRESHOLD = 1.5 * 1024 * 1024;
const QUALITY = 0.85;

const SKIP_TYPES = new Set(['image/svg+xml', 'image/gif']);

export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || SKIP_TYPES.has(file.type)) return file;
  if (file.size <= SIZE_THRESHOLD) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY)
  );
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^./]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
}
