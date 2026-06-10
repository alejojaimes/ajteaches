import { v2 as cloudinary } from 'cloudinary';

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

const RESOURCE_TYPES = ['image', 'video', 'raw'] as const;

/**
 * Deletes every Cloudinary asset stored under a post's folders
 * (cover/content images and attachments), then removes the now-empty folders.
 */
export async function deletePostMedia(postId: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;

  const cld = getCloudinary();
  const prefixes = [`ajteaches/posts/${postId}`, `ajteaches/attachments/${postId}`];

  for (const prefix of prefixes) {
    for (const resource_type of RESOURCE_TYPES) {
      try {
        await cld.api.delete_resources_by_prefix(prefix, { resource_type });
      } catch {
        // prefix may not have assets of this resource type
      }
    }
    try {
      await cld.api.delete_folder(prefix);
    } catch {
      // folder may not exist or may not be empty
    }
  }
}

function extractCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match?.[1] ?? null;
}

/** Deletes a single Cloudinary asset by its secure URL. */
export async function deleteCloudinaryAsset(
  url: string,
  resourceType: (typeof RESOURCE_TYPES)[number] = 'image'
): Promise<void> {
  if (!isCloudinaryConfigured()) return;

  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;

  const cld = getCloudinary();
  try {
    await cld.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // ignore failures - asset may already be gone
  }
}
