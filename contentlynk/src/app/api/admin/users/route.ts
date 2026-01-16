import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  analyzeUserForBot,
  filterUsers,
  getFilterCounts,
  type UserFilter,
  type UserForBotAnalysis,
  type BotAnalysisResult
} from '@/lib/utils/bot-detection';

export interface UserWithAnalysis extends UserForBotAnalysis {
  displayName: string | null;
  avatar: string | null;
  analysis: BotAnalysisResult;
}

export interface UsersListResponse {
  users: UserWithAnalysis[];
  counts: Record<UserFilter, number>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * GET /api/admin/users
 * Get all users with bot analysis for admin panel
 *
 * Query params:
 * - filter: 'all' | 'verified' | 'unverified' | 'likely-bots' | 'suspicious'
 * - search: string (search by username or email)
 * - page: number (default 1)
 * - limit: number (default 50, max 100)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get('filter') || 'all') as UserFilter;
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    // Build search condition
    const searchCondition = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { displayName: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {};

    // Fetch all users with counts (for filtering and counts calculation)
    const allUsers = await prisma.user.findMany({
      where: searchCondition,
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Convert to UserForBotAnalysis format and add analysis
    const usersWithAnalysis: UserWithAnalysis[] = allUsers.map(user => ({
      ...user,
      analysis: analyzeUserForBot(user)
    }));

    // Calculate counts for all filters (before filtering)
    const counts = getFilterCounts(usersWithAnalysis);

    // Apply filter
    const filteredUsers = filterUsers(usersWithAnalysis, filter) as UserWithAnalysis[];

    // Apply pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    const response: UsersListResponse = {
      users: paginatedUsers,
      counts,
      total,
      page,
      limit,
      totalPages
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
