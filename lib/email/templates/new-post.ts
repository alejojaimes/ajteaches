import { getSiteUrl } from '../client';

type NewPostEmailData = {
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  slug: string;
  authorName: string;
};

export function renderNewPostEmail(post: NewPostEmailData): { subject: string; html: string } {
  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/posts/${post.slug}`;
  const accountUrl = `${siteUrl}/account`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1f2e; background: #fafafa; padding: 32px 24px;">
      <p style="font-size: 14px; font-weight: 600; color: #4f46e5; margin: 0 0 16px;">AJ Teaches · New post</p>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px;">
        ${
          post.coverImage
            ? `<img src="${post.coverImage}" alt="" style="width: 100%; border-radius: 12px; margin-bottom: 20px;" />`
            : ''
        }
        <h1 style="font-size: 22px; line-height: 1.3; margin: 0 0 12px; color: #1a1f2e;">${post.title}</h1>
        ${
          post.excerpt
            ? `<p style="font-size: 15px; line-height: 1.6; color: #6b7280; margin: 0 0 20px;">${post.excerpt}</p>`
            : ''
        }
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">by ${post.authorName}</p>
        <a href="${postUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
          Read the post
        </a>
      </div>
      <p style="font-size: 12px; color: #6b7280; margin: 24px 0 0; text-align: center;">
        You're receiving this because you subscribed to new post notifications.
        <a href="${accountUrl}" style="color: #4f46e5;">Manage your preferences</a>.
      </p>
    </div>
  `;

  return { subject: `New post: ${post.title}`, html };
}
