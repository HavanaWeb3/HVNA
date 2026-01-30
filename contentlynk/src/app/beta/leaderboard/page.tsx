'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { fadeInUp } from '@/lib/animations'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-havana">
      {/* Navigation */}
      <nav className="bg-havana-navy-light/90 backdrop-blur-md border-b border-havana-cyan/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/beta/dashboard" className="flex items-center gap-3 group">
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
            <Link href="/beta/dashboard">
              <Button variant="ghost" className="text-havana-cyan-light hover:text-white">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Trophy icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-8xl mb-6"
          >
            🏆
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Leaderboard Coming Soon
          </h1>

          <p className="text-havana-cyan-light text-lg mb-8 max-w-md mx-auto">
            As our beta community grows, we'll activate the leaderboard to celebrate our most active founders.
          </p>

          {/* Placeholder leaderboard preview */}
          <div className="bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-6 mb-8 border border-havana-cyan/20 max-w-md mx-auto">
            <h3 className="text-white font-semibold mb-4">Preview of What's Coming</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((rank) => (
                <div
                  key={rank}
                  className="flex items-center gap-4 p-3 bg-havana-navy-dark/40 rounded-xl opacity-50"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                    rank === 2 ? 'bg-gray-400 text-gray-800' :
                    'bg-orange-600 text-orange-100'
                  }`}>
                    {rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-havana-cyan to-havana-purple" />
                  <div className="flex-1 text-left">
                    <div className="h-3 w-24 bg-white/20 rounded" />
                    <div className="h-2 w-16 bg-white/10 rounded mt-1" />
                  </div>
                  <div className="h-4 w-12 bg-white/20 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-havana-cyan-light">
              Track your progress on the dashboard in the meantime
            </p>
            <Link href="/beta/dashboard">
              <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white hover:shadow-lg hover:shadow-orange-500/30">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-havana-navy-dark/80 border-t border-havana-cyan/20 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-havana-cyan-light text-sm">
            © 2026 Havana Elephant Brand • Contentlynk Beta
          </p>
        </div>
      </footer>
    </div>
  )
}
