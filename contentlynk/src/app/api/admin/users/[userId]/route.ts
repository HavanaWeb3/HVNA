import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { analyzeUserForBot, isLikelyBot } from '@/lib/utils/bot-detection';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/admin/users/[userId]
 * Get a single user's details with bot analysis
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatar: true,
        emailVerified: true,
        status: true,
        trustScore: true,
        createdAt: true,
        isAdmin: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const analysis = analyzeUserForBot(user);

    return NextResponse.json({ user: { ...user, analysis } });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[userId]
 * Delete a user account with safety checks and audit logging
 *
 * Headers:
 * - X-Deletion-Reason: string (required for verified users)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Fetch user to delete with counts
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        status: true,
        trustScore: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of admin accounts
    if (userToDelete.isAdmin) {
      return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 400 });
    }

    // Check if deletion reason is required (for verified users)
    const deletionReason = request.headers.get('X-Deletion-Reason');
    if (userToDelete.emailVerified && !deletionReason) {
      return NextResponse.json({
        error: 'Reason required for deleting verified users',
        requiresReason: true
      }, { status: 400 });
    }

    // Analyze user for bot detection
    const botAnalysis = analyzeUserForBot(userToDelete);
    const wasBot = isLikelyBot(userToDelete);

    // Calculate total activity
    const totalActivity =
      userToDelete._count.posts +
      userToDelete._count.followers +
      userToDelete._count.following +
      userToDelete._count.comments +
      userToDelete._count.likes;

    // Determine deletion type
    let deletionType: string;
    if (wasBot) {
      deletionType = 'bulk_bot';
    } else if (userToDelete.emailVerified) {
      deletionType = 'verified';
    } else {
      deletionType = 'individual';
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Clean up non-cascading relations first
      await tx.emailVerificationToken.deleteMany({ where: { userId } });
      await tx.phoneVerificationCode.deleteMany({ where: { userId } });
      await tx.passwordResetToken.deleteMany({ where: { userId } });
      await tx.signupIpTracking.deleteMany({ where: { userId } });
      await tx.phoneUsageTracking.deleteMany({ where: { userId } });

      // Archive warnings before deletion (store in deletion log reason if needed)
      const warnings = await tx.creatorWarning.findMany({
        where: { userId },
        select: { reason: true, strikeLevel: true }
      });

      // Create audit log entry
      await tx.userDeletionLog.create({
        data: {
          deletedUserId: userToDelete.id,
          deletedEmail: userToDelete.email,
          deletedUsername: userToDelete.username,
          wasVerified: userToDelete.emailVerified,
          hadActivity: totalActivity > 0,
          postsCount: userToDelete._count.posts,
          followersCount: userToDelete._count.followers,
          wasMarkedAsBot: wasBot,
          deletedBy: session.user.id,
          reason: deletionReason || (warnings.length > 0
            ? `Had ${warnings.length} warnings. ` + warnings.map(w => w.reason).join(', ')
            : null),
          deletionType
        }
      });

      // Delete the user (cascading will handle posts, comments, likes, follows, etc.)
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({
      success: true,
      message: wasBot ? 'Bot account deleted' : 'User deleted',
      deletedData: {
        posts: userToDelete._count.posts,
        comments: userToDelete._count.comments,
        likes: userToDelete._count.likes,
        followers: userToDelete._count.followers,
        following: userToDelete._count.following
      },
      warnings: userToDelete.emailVerified
        ? ['User had verified email']
        : undefined
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
