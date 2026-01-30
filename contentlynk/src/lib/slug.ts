/**
 * Slug Generation Utilities
 *
 * Provides functions for generating URL-safe slugs,
 * calculating reading time, and generating excerpts.
 */

import slugify from 'slugify'
import { prisma } from '@/lib/db'

/**
 * Generate a URL-safe slug from a title
 */
export function createSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  })
}

/**
 * Generate a unique slug by checking against existing posts
 * Appends a number suffix if the slug already exists
 */
export async function generateUniqueSlug(title: string, authorId: string): Promise<string> {
  const baseSlug = createSlug(title)

  // Check if slug exists for this author
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        slug,
        authorId,
      },
    })

    if (!existing) {
      break
    }

    // Append counter to make unique
    slug = `${baseSlug}-${counter}`
    counter++

    // Safety limit
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`
      break
    }
  }

  return slug
}

/**
 * Calculate estimated reading time in minutes
 * Assumes average reading speed of 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.ceil(words / wordsPerMinute)
  return Math.max(1, readingTime) // Minimum 1 minute
}

/**
 * Generate an excerpt from content
 * Truncates at word boundary and adds ellipsis if needed
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Strip HTML tags if present
  const plainText = content.replace(/<[^>]*>/g, '').trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  // Find the last space before maxLength
  const truncated = plainText.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}
