'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import {
  WelcomeScreen,
  AnimatedListItem,
  TimelineItem,
  PulsingLogo,
} from './WelcomeScreen'

interface WelcomeFlowProps {
  onComplete: () => void
  onSkip: () => void
}

const TOTAL_SCREENS = 4
const SWIPE_THRESHOLD = 50

export function WelcomeFlow({ onComplete, onSkip }: WelcomeFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [direction, setDirection] = useState(0)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentScreen < TOTAL_SCREENS - 1) {
          goToNext()
        } else {
          onComplete()
        }
      } else if (e.key === 'ArrowLeft' && currentScreen > 0) {
        goToPrev()
      } else if (e.key === 'Escape') {
        onSkip()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentScreen, onComplete, onSkip])

  const goToNext = useCallback(() => {
    if (currentScreen < TOTAL_SCREENS - 1) {
      setDirection(1)
      setCurrentScreen((prev) => prev + 1)
    }
  }, [currentScreen])

  const goToPrev = useCallback(() => {
    if (currentScreen > 0) {
      setDirection(-1)
      setCurrentScreen((prev) => prev - 1)
    }
  }, [currentScreen])

  // Handle swipe gestures
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD && currentScreen > 0) {
      goToPrev()
    } else if (info.offset.x < -SWIPE_THRESHOLD && currentScreen < TOTAL_SCREENS - 1) {
      goToNext()
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-havana-navy/95 backdrop-blur-xl flex flex-col"
    >
      {/* Skip button (not on last screen) */}
      {currentScreen < TOTAL_SCREENS - 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onSkip}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-full hover:bg-white/10"
        >
          Skip
        </motion.button>
      )}

      {/* Main content area with swipe support */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {currentScreen === 0 && <Screen1 />}
            {currentScreen === 1 && <Screen2 />}
            {currentScreen === 2 && <Screen3 />}
            {currentScreen === 3 && <Screen4 onComplete={onComplete} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots and navigation */}
      <div className="p-6 flex flex-col items-center gap-4 bg-gradient-to-t from-havana-navy-dark/80 to-transparent">
        {/* Progress dots */}
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_SCREENS }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentScreen ? 1 : -1)
                setCurrentScreen(index)
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentScreen
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to screen ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation button (not on last screen) */}
        {currentScreen < TOTAL_SCREENS - 1 && (
          <Button
            onClick={goToNext}
            className="bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white hover:shadow-lg hover:shadow-orange-500/30 px-8 py-3 text-lg font-semibold"
          >
            Next
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// Screen 1: Welcome to the Revolution
function Screen1() {
  return (
    <WelcomeScreen className="bg-gradient-to-br from-[#FF6B35]/20 to-[#FBB03B]/20">
      <div className="max-w-lg mx-auto text-center space-y-6">
        <PulsingLogo
          src="/images/contentlynk-logo.png"
          alt="Contentlynk"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🎉 Congratulations!
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] bg-clip-text text-transparent">
            You're a Beta Founder
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-havana-cyan-light"
        >
          You're joining the movement rewriting the rules of creator compensation
        </motion.p>

        {/* Key stat visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-havana-navy-light/60 rounded-2xl p-6 border border-havana-cyan/30"
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] bg-clip-text text-transparent">
                55-75%
              </div>
              <div className="text-sm text-havana-cyan-light">Contentlynk</div>
            </div>
            <div className="text-2xl text-white/50">vs</div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-500">
                0-5%
              </div>
              <div className="text-sm text-gray-400">Traditional</div>
            </div>
          </div>
          <p className="text-white mt-4 font-medium">Revenue Share Comparison</p>
        </motion.div>
      </div>
    </WelcomeScreen>
  )
}

// Screen 2: Your Beta Founder Status
function Screen2() {
  const benefits = [
    'Maximum 75% Revenue Share (Genesis Tier)',
    'Zero Follower Requirements to Earn',
    'Priority Platform Access - 6 Months Early',
    'Lifetime Premium Features',
    'Governance Voting Rights',
    'First Access to NFT Collections',
    'Beta Founder Badge',
  ]

  return (
    <WelcomeScreen className="bg-gradient-to-br from-havana-purple/20 to-havana-pink/20">
      <div className="max-w-lg mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🏆 Exclusive Founder Benefits
          </h1>
          <h2 className="text-xl text-havana-purple-light">
            Locked In Forever
          </h2>
        </motion.div>

        <div className="space-y-3">
          {benefits.map((benefit, index) => (
            <AnimatedListItem key={index} delay={0.2 + index * 0.1}>
              {benefit}
            </AnimatedListItem>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center bg-gradient-to-r from-[#FF6B35]/20 to-[#FBB03B]/20 rounded-xl p-4 border border-[#FBB03B]/30"
        >
          <p className="text-[#FBB03B] font-semibold">
            Your early belief = Maximum rewards
          </p>
        </motion.div>
      </div>
    </WelcomeScreen>
  )
}

// Screen 3: The Journey to Launch
function Screen3() {
  const timeline = [
    { status: 'complete' as const, label: 'Platform Development: 85% Complete', delay: 0.2 },
    { status: 'complete' as const, label: 'Smart Contracts: Deployed & Audited', delay: 0.4 },
    { status: 'active' as const, label: 'Beta Community: Growing Daily', delay: 0.6 },
    { status: 'pending' as const, label: 'Ad Revenue Partnerships: In Progress', delay: 0.8 },
    { status: 'pending' as const, label: 'Token Launch: Q1 2026', delay: 1.0 },
    { status: 'pending' as const, label: 'Full Public Launch: Q2 2026', delay: 1.2 },
  ]

  return (
    <WelcomeScreen className="bg-gradient-to-br from-havana-cyan/20 to-havana-purple/20">
      <div className="max-w-lg mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            📅 Our Path to Q2 2026
          </h1>
          <h2 className="text-xl text-havana-cyan-light">
            The Journey to Launch
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative space-y-4 pl-2">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-emerald-500 via-havana-cyan to-gray-500" />

          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              status={item.status}
              label={item.label}
              delay={item.delay}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="text-center text-havana-cyan-light text-sm"
        >
          Building something revolutionary takes time - but we're almost there
        </motion.div>
      </div>
    </WelcomeScreen>
  )
}

// Screen 4: What Happens Next
function Screen4({ onComplete }: { onComplete: () => void }) {
  const steps = [
    {
      number: '1️⃣',
      title: 'Explore the Platform',
      description: 'Get familiar with features and interface',
    },
    {
      number: '2️⃣',
      title: 'Create Content (Optional)',
      description: 'Build your portfolio for Day 1 earnings',
    },
    {
      number: '3️⃣',
      title: 'Invite Fellow Creators',
      description: 'Help us grow the community',
    },
    {
      number: '4️⃣',
      title: 'Join the Community',
      description: 'Connect with other founders',
    },
  ]

  return (
    <WelcomeScreen className="bg-gradient-to-br from-[#FF6B35]/20 to-havana-purple/20">
      <div className="max-w-lg mx-auto w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🚀 Your Next Steps
          </h1>
          <h2 className="text-xl text-havana-cyan-light">
            What Happens Now
          </h2>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.15 }}
              className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
            >
              <span className="text-2xl">{step.number}</span>
              <div>
                <h3 className="text-white font-semibold">{step.title}</h3>
                <p className="text-havana-cyan-light text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-3 justify-center"
        >
          <a
            href="https://discord.gg/havanaelephant"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
            </svg>
            Discord
          </a>
          <a
            href="https://t.me/havanaelephant"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#006699] text-white rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Telegram
          </a>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="pt-4"
        >
          <Button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white hover:shadow-lg hover:shadow-orange-500/30 py-4 text-lg font-bold"
          >
            Enter Platform
          </Button>
        </motion.div>
      </div>
    </WelcomeScreen>
  )
}
