'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cardHover, fadeInUp } from '@/lib/animations'

export function LeaderboardTeaser() {
  // Placeholder avatars with gradient backgrounds
  const placeholderAvatars = [
    { letter: 'S', gradient: 'from-emerald-500 to-teal-500' },
    { letter: 'M', gradient: 'from-purple-500 to-pink-500' },
    { letter: 'J', gradient: 'from-orange-500 to-red-500' },
    { letter: 'A', gradient: 'from-blue-500 to-cyan-500' },
    { letter: 'K', gradient: 'from-yellow-500 to-orange-500' },
  ]

  const activities = [
    'Creating content',
    'Inviting creators',
    'Testing features',
  ]

  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="relative"
      aria-label="Beta leaderboard teaser"
    >
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        className="bg-gradient-to-br from-havana-navy-light/80 to-havana-cyan/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-havana-cyan/30 cursor-default"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Trophy">🏆</span>
              Most Active Beta Founders
            </h2>
            <p className="text-havana-cyan-light mb-4">
              {activities.join(', ')}
            </p>

            {/* Placeholder avatars */}
            <div className="flex items-center">
              <div className="flex -space-x-3">
                {placeholderAvatars.map((avatar, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${avatar.gradient} border-3 border-havana-navy-light flex items-center justify-center shadow-lg`}
                    style={{ zIndex: placeholderAvatars.length - index }}
                  >
                    <span className="text-white font-bold text-sm">
                      {avatar.letter}
                    </span>
                    {/* Rank badge for top 3 */}
                    {index < 3 && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-havana-navy-dark rounded-full flex items-center justify-center border-2 border-havana-cyan/50">
                        <span className="text-[10px] text-havana-cyan font-bold">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <span className="ml-4 text-havana-cyan-light text-sm">
                + more active founders
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Link href="/beta/leaderboard" aria-label="View full leaderboard">
              <Button
                className="bg-gradient-to-r from-havana-cyan to-havana-purple text-white hover:shadow-lg hover:shadow-havana-cyan/30 transition-all px-6"
              >
                See Full Leaderboard
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>

        {/* Activity indicators */}
        <div className="mt-6 pt-6 border-t border-havana-cyan/20">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Posts Created', icon: '📝' },
              { label: 'Invites Sent', icon: '📨' },
              { label: 'Features Tested', icon: '🧪' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-3 bg-havana-navy-dark/30 rounded-lg"
              >
                <span className="text-xl mb-1 block" role="img" aria-hidden="true">
                  {stat.icon}
                </span>
                <span className="text-xs text-havana-cyan-light">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}
