import { prisma } from '@/lib/db';

/**
 * Generate a URL-friendly slug from a title
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug for a post, appending numbers if needed
 */
export async function generateUniqueSlug(title: string, existingSlug?: string): Promise<string> {
  // If we already have a slug and it's valid, use it
  if (existingSlug) {
    return existingSlug;
  }

  const baseSlug = slugify(title);

  if (!baseSlug) {
    // If title produces empty slug, generate a random one
    return `post-${Date.now()}`;
  }

  // Check if slug already exists
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!existing) {
      return slug;
    }

    // Slug exists, try with counter
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit
    if (counter > 100) {
      return `${baseSlug}-${Date.now()}`;
    }
  }
}

/**
 * Calculate estimated reading time in minutes based on word count
 * Average reading speed: ~200-250 words per minute
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;

  // Strip HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, '');

  // Count words
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time (assuming 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);

  // Minimum 1 minute
  return Math.max(1, readingTime);
}

/**
 * Generate an excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  if (!content) return '';

  // Strip HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');

  // Trim and normalize whitespace
  const normalized = plainText.trim().replace(/\s+/g, ' ');

  if (normalized.length <= maxLength) {
    return normalized;
  }

  // Cut at maxLength and find last complete word
  const truncated = normalized.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}
