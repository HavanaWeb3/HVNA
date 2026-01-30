'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface WelcomeScreenProps {
  children: ReactNode
  className?: string
}

export function WelcomeScreen({ children, className = '' }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Animated list item that appears one by one
interface AnimatedListItemProps {
  children: ReactNode
  delay?: number
  icon?: string
}

export function AnimatedListItem({ children, delay = 0, icon = '✓' }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex items-start gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm"
    >
      <span className="text-emerald-400 text-xl flex-shrink-0">{icon}</span>
      <span className="text-white">{children}</span>
    </motion.div>
  )
}

// Timeline item component
interface TimelineItemProps {
  status: 'complete' | 'active' | 'pending'
  label: string
  delay?: number
}

export function TimelineItem({ status, label, delay = 0 }: TimelineItemProps) {
  const statusConfig = {
    complete: {
      icon: '✓',
      iconBg: 'bg-emerald-500',
      lineBg: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    active: {
      icon: '🔄',
      iconBg: 'bg-havana-cyan',
      lineBg: 'bg-havana-cyan/50',
      textColor: 'text-havana-cyan',
    },
    pending: {
      icon: '⏳',
      iconBg: 'bg-gray-500',
      lineBg: 'bg-gray-500/30',
      textColor: 'text-gray-400',
    },
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex items-center gap-4"
    >
      <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center text-white font-bold shadow-lg`}>
        {config.icon}
      </div>
      <div className={`flex-1 ${config.textColor} font-medium`}>
        {label}
      </div>
    </motion.div>
  )
}

// Pulsing logo component
export function PulsingLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.9, 1, 0.9],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="relative w-32 h-32 md:w-40 md:h-40"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] rounded-full blur-xl"
      />
      <img
        src={src}
        alt={alt}
        className="relative w-full h-full object-contain drop-shadow-2xl"
      />
    </motion.div>
  )
}
