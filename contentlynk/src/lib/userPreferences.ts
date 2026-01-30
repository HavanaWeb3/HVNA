import { prisma } from '@/lib/db'

export interface UserPreferences {
  hasSeenWelcome: boolean
}

/**
 * Get user preferences including welcome flow status
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasSeenWelcome: true,
      },
    })

    if (!user) return null

    return {
      hasSeenWelcome: user.hasSeenWelcome,
    }
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return null
  }
}

/**
 * Mark the welcome flow as seen for a user
 */
export async function markWelcomeSeen(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { hasSeenWelcome: true },
    })
    return true
  } catch (error) {
    console.error('Error marking welcome as seen:', error)
    return false
  }
}

/**
 * Reset welcome flow for a user (for testing purposes)
 */
export async function resetWelcomeFlow(userId: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { hasSeenWelcome: false },
    })
    return true
  } catch (error) {
    console.error('Error resetting welcome flow:', error)
    return false
  }
}
