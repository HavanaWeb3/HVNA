import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPreferences, markWelcomeSeen } from '@/lib/userPreferences'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await getUserPreferences(session.user.id)

    if (!preferences) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'markWelcomeSeen') {
      const success = await markWelcomeSeen(session.user.id)

      if (!success) {
        return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
      }

      return NextResponse.json({ success: true, hasSeenWelcome: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
