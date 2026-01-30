/**
 * Referral System Foundation
 *
 * This module provides utilities for the beta referral system.
 * Currently implements basic functionality with logging for analytics.
 * Ready for full tracking integration later.
 */

import { prisma } from '@/lib/db'

/**
 * Generate a unique referral code for a user
 * Uses a combination of user ID and random string for uniqueness
 */
export function generateReferralCode(userId: string): string {
  // Take first 8 chars of userId and append random suffix
  const baseCode = userId.slice(0, 8)
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${baseCode}-${randomSuffix}`
}

/**
 * Create a full referral link
 */
export function createReferralLink(referralCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contentlynk.com'
  return `${baseUrl}/beta/invite/${referralCode}`
}

/**
 * Get or create a referral code for a user
 * In the future, this would be stored in the database
 */
export async function getUserReferralCode(userId: string): Promise<string> {
  // For now, generate deterministically from userId
  // In production, this would be stored/retrieved from database
  const code = generateReferralCode(userId)

  // Log for analytics
  console.log(`[Referral] Generated code for user ${userId}: ${code}`)

  return code
}

/**
 * Track a referral link click
 * Currently just logs - ready for database integration
 */
export async function trackReferralClick(referralCode: string, metadata?: {
  userAgent?: string
  ipAddress?: string
  referrer?: string
}): Promise<void> {
  // Log the click for now
  console.log('[Referral] Link clicked:', {
    code: referralCode,
    timestamp: new Date().toISOString(),
    ...metadata,
  })

  // TODO: Store in database when referral tracking table is added
  // await prisma.referralClick.create({
  //   data: {
  //     referralCode,
  //     ...metadata,
  //   }
  // })
}

/**
 * Get referral stats for a user
 * Returns placeholder data - ready for real tracking
 */
export async function getUserReferralStats(userId: string): Promise<{
  totalClicks: number
  totalSignups: number
  pendingRewards: number
}> {
  // Placeholder stats - will be populated when tracking is live
  return {
    totalClicks: 0,
    totalSignups: 0,
    pendingRewards: 0,
  }
}

/**
 * Validate a referral code format
 */
export function isValidReferralCode(code: string): boolean {
  // Format: 8 chars + hyphen + 4 uppercase chars
  const pattern = /^[a-zA-Z0-9]{8}-[A-Z0-9]{4}$/
  return pattern.test(code)
}
