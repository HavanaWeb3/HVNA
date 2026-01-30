'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { staggerContainer, fadeInUp } from '@/lib/animations'

// Changelog data with full details
const changelogEntries = [
  {
    date: 'Jan 28, 2026',
    title: 'Smart Contracts Deployed & Audited',
    description: 'Our Solidity smart contracts have been deployed to Ethereum mainnet and passed security audit by CertiK. This includes the $HVNA token contract, creator rewards distribution, and NFT minting contracts.',
    category: 'Features',
    status: 'completed' as const,
    details: [
      'ERC-20 token contract for $HVNA deployed',
      'Creator rewards distribution contract live',
      'NFT membership tier contracts deployed',
      'CertiK security audit passed with no critical issues',
    ],
  },
  {
    date: 'Jan 25, 2026',
    title: 'Email Verification System Live',
    description: 'Enhanced security with email verification for all new accounts. Users now receive a verification email upon signup and must verify before accessing full platform features.',
    category: 'Features',
    status: 'completed' as const,
    details: [
      'Automated verification emails on signup',
      'Resend verification option',
      'Verification status badge on profile',
      'Rate limiting to prevent abuse',
    ],
  },
  {
    date: 'Jan 20, 2026',
    title: 'Wallet Integration Complete',
    description: 'Full Web3 wallet support is now live. Connect MetaMask, WalletConnect, Coinbase Wallet, or Rainbow to verify your NFT holdings and unlock higher revenue tiers.',
    category: 'Features',
    status: 'completed' as const,
    details: [
      'MetaMask support',
      'WalletConnect integration',
      'Coinbase Wallet support',
      'Rainbow wallet support',
      'Automatic NFT tier detection',
    ],
  },
  {
    date: 'Jan 15, 2026',
    title: 'Anti-Gaming Protection Added',
    description: 'Implemented comprehensive anti-gaming measures to ensure fair reward distribution. Our system detects and prevents artificial engagement manipulation.',
    category: 'Improvements',
    status: 'completed' as const,
    details: [
      'Velocity monitoring for engagement patterns',
      'Diversity scoring for audience distribution',
      'Bot detection algorithms',
      'Progressive penalty system for violations',
    ],
  },
  {
    date: 'Jan 10, 2026',
    title: 'Quality Score Algorithm v2',
    description: 'Updated our Quality Score algorithm to better reward meaningful engagement. Comments and shares now weighted more heavily than likes.',
    category: 'Improvements',
    status: 'completed' as const,
    details: [
      'New formula: Likes + Comments×5 + Shares×20',
      'Content completion tracking',
      'Scroll depth analysis for articles',
      'Watch time tracking for videos',
    ],
  },
  {
    date: 'Jan 5, 2026',
    title: 'Creator Dashboard v1 Launch',
    description: 'Launched the first version of the creator dashboard with real-time analytics, earnings tracking, and content management.',
    category: 'Features',
    status: 'completed' as const,
    details: [
      'Real-time engagement metrics',
      'Earnings breakdown by content',
      'Content management tools',
      'Performance analytics',
    ],
  },
  {
    date: 'Coming Q1 2026',
    title: 'Token Launch',
    description: '$HVNA token public launch with liquidity pools and exchange listings.',
    category: 'Features',
    status: 'upcoming' as const,
    details: [
      'Public token sale',
      'DEX liquidity pools',
      'CEX listings (pending)',
      'Staking rewards activation',
    ],
  },
  {
    date: 'Coming Q2 2026',
    title: 'Full Public Launch',
    description: 'Platform opens to all creators. Ad revenue partnerships activated, full earnings distribution begins.',
    category: 'Features',
    status: 'upcoming' as const,
    details: [
      'Open registration for all creators',
      'Ad revenue sharing activated',
      'Brand partnership marketplace',
      'Mobile app launch',
    ],
  },
]

const categories = ['All', 'Features', 'Improvements', 'Fixes']

export default function ChangelogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredEntries = selectedCategory === 'All'
    ? changelogEntries
    : changelogEntries.filter(entry => entry.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-havana">
      {/* Navigation */}
      <nav className="bg-havana-navy-light/90 backdrop-blur-md border-b border-havana-cyan/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/beta/dashboard" className="flex items-center gap-3 group" aria-label="Back to dashboard">
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

      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Development Updates
          </h1>
          <p className="text-havana-cyan-light text-lg">
            Track our progress as we build the future of creator compensation
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white'
                  : 'bg-havana-navy-light/60 text-havana-cyan-light hover:bg-havana-navy-light'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-havana-cyan via-havana-purple to-havana-pink" />

          <div className="space-y-8">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative pl-12 sm:pl-20"
              >
                {/* Timeline dot */}
                <div className={`absolute left-2 sm:left-6 w-4 h-4 rounded-full border-2 ${
                  entry.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-400'
                    : 'bg-havana-purple border-havana-purple-light'
                }`} />

                {/* Entry card */}
                <div className="bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-6 border border-havana-cyan/20 hover:border-havana-cyan/40 transition-all">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-havana-purple/20 text-havana-purple-light'
                    }`}>
                      {entry.status === 'completed' ? '✓ Completed' : '⏳ Upcoming'}
                    </span>
                    <span className="px-2 py-1 bg-havana-cyan/10 text-havana-cyan text-xs rounded-full">
                      {entry.category}
                    </span>
                    <span className="text-havana-cyan-light text-sm">
                      {entry.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-havana-cyan-light mb-4">
                    {entry.description}
                  </p>

                  {entry.details && (
                    <ul className="space-y-1">
                      {entry.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-havana-cyan mt-1">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Back to Dashboard CTA */}
        <motion.div variants={fadeInUp} className="text-center mt-12">
          <Link href="/beta/dashboard">
            <Button className="bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] text-white hover:shadow-lg hover:shadow-orange-500/30">
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.main>

      {/* Footer */}
      <footer className="bg-havana-navy-dark/80 border-t border-havana-cyan/20 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-havana-cyan-light text-sm">
            © 2026 Havana Elephant Brand • Contentlynk Beta
          </p>
        </div>
      </footer>
    </div>
  )
}
