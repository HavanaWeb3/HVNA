'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp, pulse } from '@/lib/animations'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress?: {
    current: number
    required: number
  }
  unlockedAt?: string
}

interface AchievementBadgesProps {
  className?: string
}

export function AchievementBadges({ className = '' }: AchievementBadgesProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  const badges: Badge[] = [
    {
      id: 'early-believer',
      name: 'Early Believer',
      description: 'Joined during beta - one of the first to believe in the vision',
      icon: '🌟',
      unlocked: true,
      unlockedAt: 'Earned on signup',
    },
    {
      id: 'content-creator',
      name: 'Content Creator',
      description: 'Create 3 posts to unlock',
      icon: '✍️',
      unlocked: false,
      progress: {
        current: 0,
        required: 3,
      },
    },
    {
      id: 'community-builder',
      name: 'Community Builder',
      description: 'Invite 5 creators to unlock',
      icon: '🤝',
      unlocked: false,
      progress: {
        current: 0,
        required: 5,
      },
    },
  ]

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-havana-purple/30 ${className}`}
      aria-label="Achievement badges"
    >
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="Medal">🎖️</span>
        Your Achievements
      </h2>
      <p className="text-havana-cyan-light mb-6">
        Earn badges by engaging with the platform
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="relative"
            onMouseEnter={() => setHoveredBadge(badge.id)}
            onMouseLeave={() => setHoveredBadge(null)}
            onFocus={() => setHoveredBadge(badge.id)}
            onBlur={() => setHoveredBadge(null)}
          >
            <motion.div
              variants={badge.unlocked ? pulse : undefined}
              initial="initial"
              animate={badge.unlocked ? 'pulse' : 'initial'}
              className={`relative p-4 rounded-xl text-center transition-all cursor-default ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-[#FF6B35]/20 to-[#FBB03B]/20 border-2 border-[#FBB03B]/50'
                  : 'bg-havana-navy-dark/40 border border-havana-cyan/10 opacity-60'
              }`}
              tabIndex={0}
              role="button"
              aria-label={`${badge.name}: ${badge.unlocked ? 'Unlocked' : 'Locked'}`}
            >
              {/* Lock overlay for locked badges */}
              {!badge.unlocked && (
                <div className="absolute top-2 right-2">
                  <span className="text-sm" role="img" aria-label="Locked">🔒</span>
                </div>
              )}

              {/* Badge icon */}
              <div
                className={`text-4xl mb-2 ${
                  badge.unlocked ? '' : 'grayscale opacity-50'
                }`}
              >
                {badge.icon}
              </div>

              {/* Badge name */}
              <h3
                className={`font-semibold text-sm ${
                  badge.unlocked ? 'text-white' : 'text-gray-400'
                }`}
              >
                {badge.name}
              </h3>

              {/* Progress bar for locked badges */}
              {!badge.unlocked && badge.progress && (
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-havana-navy-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-havana-cyan to-havana-purple transition-all duration-500"
                      style={{
                        width: `${(badge.progress.current / badge.progress.required) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {badge.progress.current}/{badge.progress.required}
                  </p>
                </div>
              )}

              {/* Unlocked indicator */}
              {badge.unlocked && (
                <div className="mt-2">
                  <span className="text-xs text-[#FBB03B]">
                    {badge.unlockedAt}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredBadge === badge.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-havana-navy-dark rounded-lg shadow-xl border border-havana-cyan/30 whitespace-nowrap"
                  role="tooltip"
                >
                  <p className="text-sm text-white font-medium">{badge.name}</p>
                  <p className="text-xs text-havana-cyan-light">{badge.description}</p>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-8 border-transparent border-t-havana-navy-dark" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
