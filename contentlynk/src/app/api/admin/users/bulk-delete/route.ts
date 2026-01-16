import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isLikelyBot, type UserForBotAnalysis } from '@/lib/utils/bot-detection';

const MAX_BULK_DELETE = 50;

interface BulkDeleteRequest {
  userIds: string[];
  confirmedBotsOnly: boolean;
}

/**
 * POST /api/admin/users/bulk-delete
 * Bulk delete bot accounts
 *
 * Body:
 * - userIds: string[] - Array of user IDs to delete
 * - confirmedBotsOnly: boolean - Must be true to proceed (safety check)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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

    const body: BulkDeleteRequest = await request.json();
    const { userIds, confirmedBotsOnly } = body;

    // Validate request
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'userIds array is required' }, { status: 400 });
    }

    if (!confirmedBotsOnly) {
      return NextResponse.json({
        error: 'confirmedBotsOnly must be true to proceed with bulk deletion'
      }, { status: 400 });
    }

    if (userIds.length > MAX_BULK_DELETE) {
      return NextResponse.json({
        error: `Maximum ${MAX_BULK_DELETE} users can be deleted at once`
      }, { status: 400 });
    }

    // Prevent self-deletion
    if (userIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Fetch all users to validate they are bots
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        email: true,
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

    // Check for admin accounts
    const adminAccounts = usersToDelete.filter(u => u.isAdmin);
    if (adminAccounts.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete admin accounts',
        adminUsernames: adminAccounts.map(u => u.username)
      }, { status: 400 });
    }

    // Check for verified users
    const verifiedUsers = usersToDelete.filter(u => u.emailVerified);
    if (verifiedUsers.length > 0) {
      return NextResponse.json({
        error: 'Bulk delete is only available for unverified bot accounts',
        verifiedCount: verifiedUsers.length,
        verifiedUsernames: verifiedUsers.map(u => u.username)
      }, { status: 400 });
    }

    // Validate each user is actually a likely bot
    const nonBots: string[] = [];
    const confirmedBots: UserForBotAnalysis[] = [];

    for (const user of usersToDelete) {
      if (isLikelyBot(user)) {
        confirmedBots.push(user);
      } else {
        nonBots.push(user.username);
      }
    }

    if (nonBots.length > 0) {
      return NextResponse.json({
        error: 'Some users are not identified as likely bots',
        nonBotUsernames: nonBots,
        confirmedBotCount: confirmedBots.length
      }, { status: 400 });
    }

    // Track deletion stats
    let deletedCount = 0;
    const deletionErrors: string[] = [];

    // Use a transaction for each deletion to ensure partial success is possible
    for (const user of confirmedBots) {
      try {
        await prisma.$transaction(async (tx) => {
          // Clean up non-cascading relations
          await tx.emailVerificationToken.deleteMany({ where: { userId: user.id } });
          await tx.phoneVerificationCode.deleteMany({ where: { userId: user.id } });
          await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
          await tx.signupIpTracking.deleteMany({ where: { userId: user.id } });
          await tx.phoneUsageTracking.deleteMany({ where: { userId: user.id } });

          // Create audit log
          await tx.userDeletionLog.create({
            data: {
              deletedUserId: user.id,
              deletedEmail: user.email,
              deletedUsername: user.username,
              wasVerified: false,
              hadActivity: false,
              postsCount: user._count?.posts ?? 0,
              followersCount: user._count?.followers ?? 0,
              wasMarkedAsBot: true,
              deletedBy: session.user.id,
              reason: 'Bulk bot deletion',
              deletionType: 'bulk_bot'
            }
          });

          // Delete the user
          await tx.user.delete({ where: { id: user.id } });
        });

        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete user ${user.username}:`, err);
        deletionErrors.push(user.username);
      }
    }

    if (deletionErrors.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount} bot accounts with ${deletionErrors.length} errors`,
        deletedCount,
        errors: deletionErrors
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} bot accounts`,
      deletedCount
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json({ error: 'Failed to delete users' }, { status: 500 });
  }
}
