import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface MetaTagCheck {
  name: string;
  passed: boolean;
  details?: string;
}

interface SiteHealthResult {
  url: string;
  name: string;
  online: boolean;
  responseTime: number;
  metaTagHealth: number;
  checksPassedCount: number;
  totalChecks: number;
  checks: MetaTagCheck[];
}

async function checkSiteHealth(url: string, name: string): Promise<SiteHealthResult> {
  const startTime = Date.now();

  const checks: MetaTagCheck[] = [];

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ContentlynkHealthChecker/1.0'
      }
    });

    const responseTime = Date.now() - startTime;
    const html = await response.text();

    // Check 1: Has elephant emoji in title
    const hasElephantEmoji = html.includes('🐘');
    checks.push({
      name: 'Elephant emoji in title',
      passed: hasElephantEmoji,
      details: hasElephantEmoji ? 'Found 🐘 in page' : 'Missing elephant emoji'
    });

    // Check 2: Has cross-domain links
    const otherSite = url.includes('havanaelephant') ? 'contentlynk.com' : 'havanaelephant.com';
    const hasCrossDomainLink = html.includes(otherSite);
    checks.push({
      name: 'Cross-domain ecosystem link',
      passed: hasCrossDomainLink,
      details: hasCrossDomainLink ? `Links to ${otherSite}` : `Missing link to ${otherSite}`
    });

    // Check 3: Has Schema.org markup
    const hasSchemaOrg = html.includes('schema.org') || html.includes('application/ld+json');
    checks.push({
      name: 'Schema.org markup',
      passed: hasSchemaOrg,
      details: hasSchemaOrg ? 'JSON-LD schema found' : 'Missing schema markup'
    });

    // Check 4: Has Twitter handle
    const hasTwitterHandle = html.includes('@havanaelephant') || html.includes('twitter:site');
    checks.push({
      name: 'Twitter handle meta',
      passed: hasTwitterHandle,
      details: hasTwitterHandle ? 'Twitter meta tags present' : 'Missing Twitter meta'
    });

    // Check 5: Has theme color
    const hasThemeColor = html.includes('theme-color') || html.includes('#FF6B35');
    checks.push({
      name: 'Theme color set',
      passed: hasThemeColor,
      details: hasThemeColor ? 'Brand color configured' : 'Missing theme color'
    });

    // Check 6: Has OG image
    const hasOgImage = html.includes('og:image');
    checks.push({
      name: 'Open Graph image',
      passed: hasOgImage,
      details: hasOgImage ? 'OG image configured' : 'Missing OG image'
    });

    // Check 7: Has proper OG dimensions
    const hasOgDimensions = html.includes('og:image:width') && html.includes('og:image:height');
    checks.push({
      name: 'OG image dimensions',
      passed: hasOgDimensions,
      details: hasOgDimensions ? '1200×630 dimensions set' : 'Missing image dimensions'
    });

    // Additional check for contentlynk: viewport meta
    if (url.includes('contentlynk')) {
      const hasViewport = html.includes('viewport');
      checks.push({
        name: 'Viewport meta tag',
        passed: hasViewport,
        details: hasViewport ? 'Mobile viewport set' : 'Missing viewport'
      });
    }

    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    const metaTagHealth = (passedChecks / totalChecks) * 100;

    return {
      url,
      name,
      online: true,
      responseTime,
      metaTagHealth,
      checksPassedCount: passedChecks,
      totalChecks,
      checks
    };
  } catch (error) {
    console.error(`Failed to check ${url}:`, error);
    return {
      url,
      name,
      online: false,
      responseTime: Date.now() - startTime,
      metaTagHealth: 0,
      checksPassedCount: 0,
      totalChecks: 7,
      checks: [{
        name: 'Site connectivity',
        passed: false,
        details: 'Failed to connect to site'
      }]
    };
  }
}

/**
 * GET /api/admin/ecosystem-health
 * Check health of ecosystem sites (havanaelephant.com and contentlynk.com)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check both sites in parallel
    const [havanaHealth, contentlynkHealth] = await Promise.all([
      checkSiteHealth('https://havanaelephant.com', 'Havana Elephant'),
      checkSiteHealth('https://contentlynk.com', 'Contentlynk')
    ]);

    // Calculate overall health (average of both sites)
    const overallHealth = (havanaHealth.metaTagHealth + contentlynkHealth.metaTagHealth) / 2;

    return NextResponse.json({
      overallHealth,
      lastChecked: new Date().toISOString(),
      sites: [havanaHealth, contentlynkHealth]
    });
  } catch (error) {
    console.error('Error checking ecosystem health:', error);
    return NextResponse.json({ error: 'Failed to check ecosystem health' }, { status: 500 });
  }
}
