'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/beta/ProgressBar'
import { WelcomeFlow } from '@/components/beta/WelcomeFlow'
import { FounderVideo } from '@/components/beta/FounderVideo'
import { LeaderboardTeaser } from '@/components/beta/LeaderboardTeaser'
import { AchievementBadges } from '@/components/beta/AchievementBadges'
import { SuccessNotification } from '@/components/beta/SuccessNotification'
import { ErrorBoundary, MinimalErrorFallback } from '@/components/beta/ErrorBoundary'
import {
  staggerContainer,
  fadeInUp,
  cardHover,
  buttonTap,
} from '@/lib/animations'

// Development updates data
const developmentUpdates = [
  {
    date: 'Jan 28, 2026',
    update: 'Smart contracts deployed & audited',
    status: 'complete',
  },
  {
    date: 'Jan 25, 2026',
    update: 'Email verification system live',
    status: 'complete',
  },
  {
    date: 'Jan 20, 2026',
    update: 'Wallet integration complete',
    status: 'complete',
  },
  {
    date: 'Jan 15, 2026',
    update: 'Anti-gaming protection added',
    status: 'complete',
  },
]

// Beta founder benefits
const founderBenefits = [
  'Maximum 75% Revenue Share (Genesis Tier)',
  'Zero Follower Requirements - Earn from Day 1',
  '6 Months Early Platform Access',
  'Lifetime Premium Features',
  'Governance Voting Rights',
  'Beta Founder Badge & Recognition',
]

// What you can do during beta
const betaActivities = [
  'Test all platform features',
  'Build your content library',
  'Get familiar with the interface',
  'Connect with other beta founders',
]

export default function BetaDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [welcomeLoading, setWelcomeLoading] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Check if user has seen welcome flow
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        setWelcomeLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/preferences')
        if (response.ok) {
          const data = await response.json()
          setShowWelcome(!data.hasSeenWelcome)
        }
      } catch (error) {
        console.error('Error checking welcome status:', error)
      } finally {
        setWelcomeLoading(false)
      }
    }

    checkWelcomeStatus()
  }, [status, session?.user?.id])

  // Handle welcome flow completion
  const handleWelcomeComplete = useCallback(async () => {
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markWelcomeSeen' }),
      })
    } catch (error) {
      console.error('Error marking welcome as seen:', error)
    }
    setShowWelcome(false)
  }, [])

  // Handle welcome flow skip
  const handleWelcomeSkip = useCallback(async () => {
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markWelcomeSeen' }),
      })
    } catch (error) {
      console.error('Error marking welcome as seen:', error)
    }
    setShowWelcome(false)
  }, [])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Countdown timer to Q2 2026 (approximately May 1, 2026)
  useEffect(() => {
    const targetDate = new Date('2026-05-01T00:00:00')

    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format user join date
  const formatJoinDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Copy invite link handler
  const handleCopyInviteLink = useCallback(async () => {
    const inviteLink = `https://contentlynk.com/beta?ref=${session?.user?.id || 'beta'}`

    try {
      await navigator.clipboard.writeText(inviteLink)
      setNotificationMessage('Invite link copied to clipboard!')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      setNotificationMessage('Could not copy link. Please try again.')
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }
  }, [session?.user?.id])

  if (status === 'loading' || welcomeLoading) {
    return (
      <div className="min-h-screen bg-gradient-havana flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-havana-cyan border-t-transparent mx-auto"></div>
          <p className="mt-4 text-havana-cyan-light">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-havana">
      {/* Welcome Flow Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeFlow
            onComplete={handleWelcomeComplete}
            onSkip={handleWelcomeSkip}
          />
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <SuccessNotification
        show={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />

      {/* Navigation */}
      <nav className="bg-havana-navy-light/90 backdrop-blur-md border-b border-havana-cyan/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
              <div className="relative w-10 h-10 transition-transform group-hover:rotate-6">
                <Image
                  src="/images/contentlynk-logo.png"
                  alt="Contentlynk logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-havana-cyan to-havana-orange bg-clip-text text-transparent">
                Contentlynk
              </span>
              <span className="ml-2 px-2 py-0.5 bg-havana-orange/20 text-havana-orange text-xs font-medium rounded-full">
                BETA
              </span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-havana-cyan-light hover:text-white text-sm sm:text-base px-2 sm:px-4">
                  Dashboard
                </Button>
              </Link>
              <Link href="/earnings-calculator">
                <Button variant="ghost" className="text-havana-cyan-light hover:text-white text-sm sm:text-base px-2 sm:px-4">
                  Calculator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8"
      >
        {/* A. WELCOME HEADER */}
        <motion.section
          variants={fadeInUp}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] p-6 sm:p-8 md:p-12"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex justify-center mb-4 sm:mb-6"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 transition-transform hover:scale-105 filter drop-shadow-2xl">
                <Image
                  src="/images/contentlynk-logo.png"
                  alt="Contentlynk - Fair Creator Compensation Platform"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
              Welcome to Contentlynk Beta
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 font-medium mb-1 sm:mb-2">
              Building the Future of Creator Compensation
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/90">
              You're part of the revolution. <span className="font-bold">55-75% revenue share</span> vs 0-5% traditional platforms
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </motion.section>

        {/* B. MISSION PROGRESS SECTION */}
        <motion.section
          variants={fadeInUp}
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
          className="bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-havana-cyan/20"
          aria-label="Mission progress"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-xl sm:text-2xl" role="img" aria-label="Chart">📊</span> Mission Progress
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="space-y-4 sm:space-y-6">
              <ProgressBar
                percentage={85}
                label="Platform Development"
                color="orange"
              />
              <div className="flex items-center justify-between p-3 sm:p-4 bg-havana-navy-dark/40 rounded-xl border border-havana-cyan/10">
                <span className="text-havana-cyan-light text-sm sm:text-base">Beta Community</span>
                <span className="text-white font-semibold text-sm sm:text-base">Growing</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-3 sm:p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
              >
                <span className="text-emerald-400 text-lg sm:text-xl" role="img" aria-label="Checkmark">✓</span>
                <span className="text-white font-medium text-sm sm:text-base">Smart Contracts: Deployed & Audited</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-3 sm:p-4 bg-havana-cyan/10 rounded-xl border border-havana-cyan/30"
              >
                <span className="text-havana-cyan text-lg sm:text-xl" role="img" aria-label="Target">🎯</span>
                <span className="text-white font-medium text-sm sm:text-base">Target Launch: Q2 2026</span>
              </motion.div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-r from-havana-navy-dark/60 to-havana-navy/60 rounded-xl p-4 sm:p-6 border border-havana-purple/30">
            <h3 className="text-base sm:text-lg font-semibold text-havana-cyan-light text-center mb-3 sm:mb-4">
              Countdown to Launch
            </h3>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hours' },
                { value: countdown.minutes, label: 'Mins' },
                { value: countdown.seconds, label: 'Secs' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <motion.div
                    key={`${index}-${item.value}`}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="bg-havana-navy-light/80 rounded-lg p-2 sm:p-3 border border-havana-cyan/20"
                  >
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] bg-clip-text text-transparent">
                      {mounted ? String(item.value).padStart(2, '0') : '--'}
                    </span>
                  </motion.div>
                  <span className="text-[10px] sm:text-xs text-havana-cyan-light mt-1 block">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* C. YOUR BETA FOUNDER STATUS CARD */}
        <motion.section
          variants={fadeInUp}
          className="bg-gradient-to-br from-havana-navy-light/80 to-havana-purple/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-havana-purple/40 hover:border-havana-purple/60 transition-all"
          aria-label="Beta founder status"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl" role="img" aria-label="Trophy">🏆</span> Exclusive Beta Founder Benefits
            </h2>
            <div className="bg-havana-purple/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-havana-purple/50 self-start">
              <span className="text-havana-purple-light text-xs sm:text-sm font-medium">Beta Founder</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {founderBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(13, 27, 42, 0.5)' }}
                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-havana-navy-dark/30 rounded-lg transition-colors"
              >
                <span className="text-[#FBB03B] text-base sm:text-lg mt-0.5" role="img" aria-hidden="true">★</span>
                <span className="text-havana-cyan-light text-sm sm:text-base">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-havana-purple/30">
            <div className="text-xs sm:text-sm text-havana-cyan-light">
              <span className="text-havana-cyan">Joined:</span> {formatJoinDate()}
            </div>
            <motion.div whileTap={buttonTap}>
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all text-sm sm:text-base py-2 sm:py-2.5 px-4 sm:px-6"
                onClick={handleCopyInviteLink}
                aria-label="Copy invite link to clipboard"
              >
                Share Your Invite Link
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* ACHIEVEMENT BADGES */}
        <ErrorBoundary sectionName="Achievement Badges" fallback={<MinimalErrorFallback message="Achievements temporarily unavailable" />}>
          <AchievementBadges />
        </ErrorBoundary>

        {/* D. LATEST DEVELOPMENT UPDATES FEED */}
        <motion.section
          variants={fadeInUp}
          className="bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-havana-cyan/20"
          aria-label="Development updates"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl" role="img" aria-label="Newspaper">📰</span> Latest Development Updates
            </h2>
            <Link
              href="/beta/changelog"
              className="text-havana-cyan hover:text-havana-cyan-light text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-havana-cyan rounded"
            >
              View Full Changelog →
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {developmentUpdates.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.01, borderColor: 'rgba(0, 217, 255, 0.3)' }}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-havana-navy-dark/40 rounded-xl border border-havana-cyan/10 transition-all"
              >
                <div className="flex-shrink-0 w-20 sm:w-24 text-xs sm:text-sm text-havana-cyan-light font-medium">
                  {item.date}
                </div>
                <div className="flex-1 text-white text-sm sm:text-base">{item.update}</div>
                <div className="flex-shrink-0">
                  <span className="text-emerald-400 text-lg sm:text-xl" role="img" aria-label="Complete">✅</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FOUNDER VIDEO SECTION */}
        <ErrorBoundary sectionName="Founder Video" fallback={<MinimalErrorFallback message="Video temporarily unavailable" />}>
          <motion.div variants={fadeInUp}>
            <FounderVideo />
          </motion.div>
        </ErrorBoundary>

        {/* E. READY TO CREATE SECTION */}
        <motion.section
          variants={fadeInUp}
          className="bg-gradient-to-br from-havana-cyan/10 to-havana-purple/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-havana-cyan/30"
          aria-label="Get started creating"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-xl sm:text-2xl" role="img" aria-label="Rocket">🚀</span> Ready to Create
          </h2>

          <p className="text-havana-cyan-light mb-3 sm:mb-4 text-sm sm:text-base">While we're in beta, you can:</p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {betaActivities.map((activity, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-2 text-white text-sm sm:text-base"
              >
                <span className="text-havana-cyan" role="img" aria-hidden="true">•</span>
                {activity}
              </motion.li>
            ))}
          </ul>

          <div className="bg-havana-navy-dark/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-havana-orange/30">
            <p className="text-havana-orange-light text-xs sm:text-sm">
              <span className="font-semibold">Note:</span> Earnings activate at platform launch with retroactive bonuses for early content
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/create" className="flex-1">
              <motion.div whileTap={buttonTap}>
                <Button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white hover:shadow-lg hover:shadow-orange-500/30 transition-all py-3 sm:py-3.5 text-base sm:text-lg font-semibold">
                  Start Creating Content
                </Button>
              </motion.div>
            </Link>
            <Link href="/features" className="flex-1">
              <motion.div whileTap={buttonTap}>
                <Button
                  variant="outline"
                  className="w-full border-2 border-havana-cyan text-havana-cyan hover:bg-havana-cyan/10 transition-all py-3 sm:py-3.5 text-base sm:text-lg font-semibold"
                >
                  Explore Platform Features
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.section>

        {/* LEADERBOARD TEASER */}
        <ErrorBoundary sectionName="Leaderboard" fallback={<MinimalErrorFallback message="Leaderboard temporarily unavailable" />}>
          <LeaderboardTeaser />
        </ErrorBoundary>

        {/* F. BETA COMMUNITY TEASER */}
        <motion.section
          variants={fadeInUp}
          className="bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-havana-pink/30"
          aria-label="Beta community"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
            <span className="text-xl sm:text-2xl" role="img" aria-label="People">👥</span> Join the Beta Founder Community
          </h2>
          <p className="text-havana-cyan-light mb-4 sm:mb-6 text-sm sm:text-base">
            Founding creators are already here building the future
          </p>

          {/* Placeholder avatars */}
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="flex -space-x-2 sm:-space-x-3">
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-havana-cyan to-havana-purple border-2 border-havana-navy-light flex items-center justify-center"
                >
                  <span className="text-white text-xs sm:text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                </motion.div>
              ))}
            </div>
            <span className="ml-3 sm:ml-4 text-havana-cyan-light text-xs sm:text-sm">
              + more joining every day
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="https://discord.gg/havanaelephant"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
              aria-label="Join our Discord community (opens in new tab)"
            >
              <motion.div whileTap={buttonTap}>
                <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
                  </svg>
                  Join Discord
                </Button>
              </motion.div>
            </a>
            <a
              href="https://t.me/havanaelephant"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
              aria-label="Join our Telegram community (opens in new tab)"
            >
              <motion.div whileTap={buttonTap}>
                <Button className="w-full bg-[#0088cc] hover:bg-[#006699] text-white transition-all py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Join Telegram
                </Button>
              </motion.div>
            </a>
          </div>
        </motion.section>
      </motion.main>

      {/* Footer */}
      <footer className="bg-havana-navy-dark/80 border-t border-havana-cyan/20 py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-havana-cyan-light text-xs sm:text-sm">
            © 2026 Havana Elephant Brand • Contentlynk Beta
          </p>
          <nav className="flex justify-center space-x-4 sm:space-x-6 mt-3 sm:mt-4" aria-label="Footer navigation">
            <Link
              href="/"
              className="text-havana-cyan-light hover:text-havana-cyan transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-havana-cyan rounded"
            >
              Home
            </Link>
            <Link
              href="/earnings-calculator"
              className="text-havana-cyan-light hover:text-havana-orange transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-havana-cyan rounded"
            >
              Calculator
            </Link>
            <a
              href="mailto:beta@havanaelephant.com"
              className="text-havana-cyan-light hover:text-havana-pink transition-colors text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-havana-cyan rounded"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
