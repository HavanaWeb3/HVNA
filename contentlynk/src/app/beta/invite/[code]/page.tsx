'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  useEffect(() => {
    // Track referral click (logging for now)
    console.log('[Referral] Invite link visited:', {
      code,
      timestamp: new Date().toISOString(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    })

    // Store referral code in session storage for attribution
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('referralCode', code)
    }
  }, [code])

  return (
    <div className="min-h-screen bg-gradient-havana flex flex-col">
      {/* Navigation */}
      <nav className="bg-havana-navy-light/90 backdrop-blur-md border-b border-havana-cyan/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3 group">
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
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-24 h-24">
              <Image
                src="/images/contentlynk-logo.png"
                alt="Contentlynk"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-block bg-gradient-to-r from-[#FF6B35]/20 to-[#FBB03B]/20 px-4 py-2 rounded-full text-[#FBB03B] text-sm font-medium mb-6 border border-[#FBB03B]/30">
              🎉 You've been invited!
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Join the Creator Revolution
            </h1>

            <p className="text-havana-cyan-light text-lg mb-8">
              A fellow creator has invited you to join Contentlynk Beta - the platform where creators earn <span className="text-white font-semibold">55-75% revenue share</span> from day one.
            </p>

            {/* Benefits preview */}
            <div className="bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-6 mb-8 text-left border border-havana-cyan/20">
              <h3 className="text-white font-semibold mb-4">Beta Founder Benefits:</h3>
              <ul className="space-y-2 text-havana-cyan-light text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Maximum 75% Revenue Share (Genesis Tier)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Zero Follower Requirements to Earn
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  6 Months Early Platform Access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Lifetime Premium Features
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Link href="/beta" className="block">
                <Button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white hover:shadow-lg hover:shadow-orange-500/30 py-3 text-lg font-semibold">
                  Apply for Beta Access
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full border-havana-cyan text-havana-cyan hover:bg-havana-cyan/10">
                  Learn More First
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Referral code: {code}
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-havana-navy-dark/80 border-t border-havana-cyan/20 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-havana-cyan-light text-sm">
            © 2026 Havana Elephant Brand • Contentlynk
          </p>
        </div>
      </footer>
    </div>
  )
}
