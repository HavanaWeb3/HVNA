/**
 * Email Verification Service
 *
 * Handles email verification tokens and sending verification emails
 */

import { prisma } from '@/lib/db';
import crypto from 'crypto';

const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a unique verification token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send email verification
 *
 * @param userId - User ID
 * @param email - Email address to verify
 * @returns Token and expiry info
 */
export async function sendEmailVerification(userId: string, email: string): Promise<{
  success: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
}> {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerified: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email already verified' };
    }

    // Delete any existing tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId }
    });

    // Generate new token
    const token = generateToken();
    const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY);

    // Store token in database
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        token,
        expires
      }
    });

    // Create verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    // Send email (for now, we'll log it - integrate with email service later)
    console.log(`[Email Verification] Sending to ${email}:`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token expires in 24 hours`);

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // Example:
    // await sendEmail({
    //   to: email,
    //   subject: 'Verify your ContentLynk email',
    //   html: `
    //     <h1>Verify Your Email</h1>
    //     <p>Click the link below to verify your email address:</p>
    //     <a href="${verificationUrl}">Verify Email</a>
    //     <p>This link expires in 24 hours.</p>
    //   `
    // });

    return {
      success: true,
      token,
      expiresIn: VERIFICATION_TOKEN_EXPIRY / 1000 // seconds
    };
  } catch (error) {
    console.error('[Email Verification] Error sending verification:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

/**
 * Verify email using token
 *
 * @param token - Verification token
 * @returns Verification result
 */
export async function verifyEmail(token: string): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    // Find token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      });
      return { success: false, error: 'Token has expired' };
    }

    // Mark user email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true }
    });

    // Delete used token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id }
    });

    console.log(`[Email Verification] Email verified for user ${verificationToken.userId}`);

    return {
      success: true,
      userId: verificationToken.userId
    };
  } catch (error) {
    console.error('[Email Verification] Error verifying email:', error);
    return { success: false, error: 'Failed to verify email' };
  }
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true }
  });

  return user?.emailVerified || false;
}

/**
 * Resend verification email (with rate limiting)
 */
export async function resendEmailVerification(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if there's a recent token (prevent spam)
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
        }
      }
    });

    if (recentToken) {
      return {
        success: false,
        error: 'Please wait 5 minutes before requesting another verification email'
      };
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user?.email) {
      return { success: false, error: 'No email address found' };
    }

    // Send new verification
    const result = await sendEmailVerification(userId, user.email);
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('[Email Verification] Error resending:', error);
    return { success: false, error: 'Failed to resend verification email' };
  }
}
