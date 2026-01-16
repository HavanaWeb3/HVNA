import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ userId: string }>;
}

interface ContactRequest {
  subject: string;
  message: string;
  reason: 'unusual_username' | 'suspicious_activity' | 'verification_issue' | 'other';
}

/**
 * POST /api/admin/users/[userId]/contact
 * Send a contact email to a user (currently logs for manual follow-up)
 *
 * Body:
 * - subject: string
 * - message: string
 * - reason: 'unusual_username' | 'suspicious_activity' | 'verification_issue' | 'other'
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, username: true, email: true }
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body: ContactRequest = await request.json();
    const { subject, message, reason } = body;

    if (!subject || !message || !reason) {
      return NextResponse.json({
        error: 'subject, message, and reason are required'
      }, { status: 400 });
    }

    // Fetch user to contact
    const userToContact = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true
      }
    });

    if (!userToContact) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userToContact.email) {
      return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
    }

    // Log the contact attempt (following existing email-verification.ts pattern)
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[Admin Contact] Email to ${userToContact.email}:`);
    console.log(`From Admin: ${adminUser.email || adminUser.username}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reason: ${reason}`);
    console.log(`Message:\n${message}`);
    console.log('---');

    // In a production environment, you would send the email here:
    // await sendEmail({
    //   to: userToContact.email,
    //   subject: subject,
    //   html: `
    //     <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    //       <h2>${subject}</h2>
    //       <div style="white-space: pre-wrap;">${message}</div>
    //       <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;" />
    //       <p style="color: #666; font-size: 12px;">
    //         This email was sent from Contentlynk admin team.
    //       </p>
    //     </div>
    //   `
    // });

    return NextResponse.json({
      success: true,
      message: 'Contact logged successfully',
      note: 'Email sending is currently in development mode. Contact has been logged for manual follow-up.',
      details: {
        userId: userToContact.id,
        email: userToContact.email,
        subject,
        reason,
        sentBy: session.user.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error contacting user:', error);
    return NextResponse.json({ error: 'Failed to contact user' }, { status: 500 });
  }
}
