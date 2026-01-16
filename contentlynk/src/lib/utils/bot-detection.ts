/**
 * Bot Detection Utility
 *
 * Provides functions to identify likely bot accounts vs legitimate users.
 * Used by the admin panel for smart user filtering and deletion.
 */

// Common generic email domains that bots often use
const GENERIC_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'mail.com',
  'protonmail.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'ymail.com',
  'zoho.com',
  'gmx.com',
  'mail.ru',
  'yandex.com',
  'qq.com',
  '163.com',
  '126.com'
];

// Known temporary/disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'trashmail.com',
  'fakeinbox.com',
  'temp-mail.org',
  'disposablemail.com',
  'getnada.com'
];

export interface BotIndicator {
  type: 'username' | 'email' | 'activity' | 'verification' | 'age' | 'trust';
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface BotAnalysisResult {
  isLikelyBot: boolean;
  isSuspicious: boolean;
  isProtected: boolean;
  botScore: number; // 0-100, higher = more likely bot
  indicators: BotIndicator[];
  recommendation: 'safe_to_delete' | 'needs_review' | 'protected';
}

export interface UserForBotAnalysis {
  id: string;
  username: string;
  email: string | null;
  emailVerified: boolean;
  status: string | null;
  trustScore: number | null;
  createdAt: Date;
  isAdmin: boolean;
  _count?: {
    posts: number;
    followers: number;
    following: number;
    comments: number;
    likes: number;
  };
}

/**
 * Check if a username appears to be a random string (likely auto-generated or bot)
 */
export function hasRandomStringUsername(username: string): boolean {
  // Too short usernames are suspicious but not necessarily random
  if (username.length < 8) return false;

  // Very long usernames (>20 chars) with no spaces are suspicious
  const isLong = username.length > 20;

  // Mix of uppercase and lowercase in unusual patterns
  const hasUpperLower = /[A-Z]/.test(username) && /[a-z]/.test(username);

  // No spaces (legitimate users often use readable names)
  const noSpaces = !/\s/.test(username);

  // Check for pronounceable patterns (vowel-consonant alternation)
  const vowels = username.match(/[aeiouAEIOU]/g)?.length || 0;
  const consonants = username.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g)?.length || 0;
  const letterCount = vowels + consonants;

  // Very low vowel ratio suggests random string
  const vowelRatio = letterCount > 0 ? vowels / letterCount : 0;
  const hasLowVowelRatio = vowelRatio < 0.2;

  // Check for repeating patterns of characters (common in generated strings)
  const hasRepeatingPattern = /(.)\1{3,}/.test(username);

  // Check for long sequences of consonants (unpronounceable)
  const hasLongConsonantSequence = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(username);

  // Check for excessive numbers
  const numbers = username.match(/\d/g)?.length || 0;
  const hasExcessiveNumbers = numbers > username.length * 0.3;

  // Score-based detection
  let randomScore = 0;

  if (isLong) randomScore += 2;
  if (hasUpperLower && noSpaces && username.length > 15) randomScore += 3;
  if (hasLowVowelRatio && letterCount > 10) randomScore += 3;
  if (hasRepeatingPattern) randomScore += 2;
  if (hasLongConsonantSequence) randomScore += 3;
  if (hasExcessiveNumbers) randomScore += 2;

  // Threshold for considering it random
  return randomScore >= 5;
}

/**
 * Check if an email is from a corporate/organizational domain
 */
export function hasCorporateEmail(email: string | null): boolean {
  if (!email) return false;

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  // Not a generic consumer email domain
  if (GENERIC_EMAIL_DOMAINS.includes(domain)) return false;

  // Not a disposable email domain
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) return false;

  // Has a business-like domain structure (not just random characters)
  // Most corporate domains are recognizable words/names
  const domainName = domain.split('.')[0];
  if (domainName.length < 3) return false;

  return true;
}

/**
 * Check if an email is from a disposable/temporary email service
 */
export function hasDisposableEmail(email: string | null): boolean {
  if (!email) return false;

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  return DISPOSABLE_EMAIL_DOMAINS.some(d => domain.includes(d.split('.')[0]));
}

/**
 * Calculate account age in days
 */
export function getAccountAgeDays(createdAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Comprehensive bot analysis for a user
 */
export function analyzeUserForBot(user: UserForBotAnalysis): BotAnalysisResult {
  const indicators: BotIndicator[] = [];
  let botScore = 0;

  const postsCount = user._count?.posts ?? 0;
  const followersCount = user._count?.followers ?? 0;
  const followingCount = user._count?.following ?? 0;
  const commentsCount = user._count?.comments ?? 0;
  const likesCount = user._count?.likes ?? 0;

  const totalActivity = postsCount + followersCount + followingCount + commentsCount + likesCount;
  const accountAgeDays = getAccountAgeDays(user.createdAt);

  // === USERNAME ANALYSIS ===
  if (hasRandomStringUsername(user.username)) {
    indicators.push({
      type: 'username',
      reason: 'Username appears to be a random string',
      severity: 'medium'
    });
    botScore += 20;
  }

  // === EMAIL ANALYSIS ===
  if (!user.email) {
    indicators.push({
      type: 'email',
      reason: 'No email address',
      severity: 'high'
    });
    botScore += 30;
  } else if (hasDisposableEmail(user.email)) {
    indicators.push({
      type: 'email',
      reason: 'Uses disposable email service',
      severity: 'high'
    });
    botScore += 35;
  } else if (!user.emailVerified) {
    indicators.push({
      type: 'verification',
      reason: 'Email not verified',
      severity: 'medium'
    });
    botScore += 15;
  }

  // === ACTIVITY ANALYSIS ===
  if (totalActivity === 0) {
    indicators.push({
      type: 'activity',
      reason: 'Zero activity (no posts, followers, comments, or likes)',
      severity: 'high'
    });
    botScore += 25;
  } else if (totalActivity < 3 && accountAgeDays > 7) {
    indicators.push({
      type: 'activity',
      reason: 'Very low activity for account age',
      severity: 'low'
    });
    botScore += 10;
  }

  // === ACCOUNT AGE ANALYSIS ===
  if (accountAgeDays < 1 && totalActivity === 0) {
    indicators.push({
      type: 'age',
      reason: 'New account with no activity',
      severity: 'medium'
    });
    botScore += 15;
  }

  // === TRUST SCORE ANALYSIS ===
  if (user.trustScore !== null && user.trustScore < 50) {
    indicators.push({
      type: 'trust',
      reason: `Low trust score (${user.trustScore})`,
      severity: 'medium'
    });
    botScore += 15;
  }

  // === STATUS ANALYSIS ===
  if (user.status === 'SUSPENDED') {
    indicators.push({
      type: 'trust',
      reason: 'Account is suspended',
      severity: 'high'
    });
    botScore += 20;
  } else if (user.status === 'PROBATION') {
    indicators.push({
      type: 'trust',
      reason: 'Account is on probation',
      severity: 'medium'
    });
    botScore += 10;
  }

  // === PROTECTIVE FACTORS (reduce bot score) ===

  // Verified email significantly reduces bot likelihood
  if (user.emailVerified) {
    botScore -= 25;
  }

  // Corporate email is strong indicator of legitimate user
  if (hasCorporateEmail(user.email)) {
    botScore -= 30;
  }

  // Any posts created is a good sign
  if (postsCount > 0) {
    botScore -= 20;
  }

  // Having followers suggests real engagement
  if (followersCount > 0) {
    botScore -= 15;
  }

  // Account age > 7 days with any activity
  if (accountAgeDays > 7 && totalActivity > 0) {
    botScore -= 10;
  }

  // Normalize score to 0-100
  botScore = Math.max(0, Math.min(100, botScore));

  // Determine protection status
  const isProtected =
    user.isAdmin ||
    (user.emailVerified && hasCorporateEmail(user.email)) ||
    (user.emailVerified && postsCount > 0);

  // Determine bot/suspicious status based on score and factors
  const isLikelyBot =
    botScore >= 60 &&
    !user.emailVerified &&
    totalActivity === 0 &&
    !hasCorporateEmail(user.email);

  const isSuspicious =
    !isLikelyBot &&
    !isProtected &&
    (botScore >= 30 || indicators.length >= 2);

  // Determine recommendation
  let recommendation: BotAnalysisResult['recommendation'];
  if (isProtected) {
    recommendation = 'protected';
  } else if (isLikelyBot) {
    recommendation = 'safe_to_delete';
  } else {
    recommendation = 'needs_review';
  }

  return {
    isLikelyBot,
    isSuspicious,
    isProtected,
    botScore,
    indicators,
    recommendation
  };
}

/**
 * Quick check if a user is likely a bot (for bulk operations)
 */
export function isLikelyBot(user: UserForBotAnalysis): boolean {
  // Admin accounts are never bots
  if (user.isAdmin) return false;

  // Verified email users are unlikely to be bots
  if (user.emailVerified) return false;

  // Corporate email users are unlikely to be bots
  if (hasCorporateEmail(user.email)) return false;

  // Any activity suggests real user
  const totalActivity = (user._count?.posts ?? 0) +
                       (user._count?.followers ?? 0) +
                       (user._count?.following ?? 0);
  if (totalActivity > 0) return false;

  // Random username + unverified + no activity = likely bot
  return hasRandomStringUsername(user.username);
}

/**
 * Filter type definitions for the admin panel
 */
export type UserFilter = 'all' | 'verified' | 'unverified' | 'likely-bots' | 'suspicious';

/**
 * Get filter counts for a list of users
 */
export function getFilterCounts(users: UserForBotAnalysis[]): Record<UserFilter, number> {
  const counts: Record<UserFilter, number> = {
    all: users.length,
    verified: 0,
    unverified: 0,
    'likely-bots': 0,
    suspicious: 0
  };

  for (const user of users) {
    if (user.emailVerified) {
      counts.verified++;
    } else {
      counts.unverified++;
    }

    const analysis = analyzeUserForBot(user);
    if (analysis.isLikelyBot) {
      counts['likely-bots']++;
    } else if (analysis.isSuspicious) {
      counts.suspicious++;
    }
  }

  return counts;
}

/**
 * Filter users by the specified filter type
 */
export function filterUsers(
  users: UserForBotAnalysis[],
  filter: UserFilter
): UserForBotAnalysis[] {
  switch (filter) {
    case 'all':
      return users;
    case 'verified':
      return users.filter(u => u.emailVerified);
    case 'unverified':
      return users.filter(u => !u.emailVerified);
    case 'likely-bots':
      return users.filter(u => isLikelyBot(u));
    case 'suspicious':
      return users.filter(u => {
        const analysis = analyzeUserForBot(u);
        return analysis.isSuspicious && !analysis.isLikelyBot;
      });
    default:
      return users;
  }
}
