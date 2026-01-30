'use client'

import { useEffect, useState } from 'react'

interface ProgressBarProps {
  percentage: number
  label: string
  showPercentage?: boolean
  color?: 'orange' | 'cyan' | 'pink' | 'purple' | 'green'
  animated?: boolean
}

export function ProgressBar({
  percentage,
  label,
  showPercentage = true,
  color = 'orange',
  animated = true,
}: ProgressBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0)

  useEffect(() => {
    if (!animated) {
      setDisplayPercentage(percentage)
      return
    }

    // Animate the progress bar filling
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const increment = percentage / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= percentage) {
        setDisplayPercentage(percentage)
        clearInterval(timer)
      } else {
        setDisplayPercentage(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [percentage, animated])

  const colorClasses = {
    orange: {
      bg: 'bg-gradient-to-r from-[#FF6B35] to-[#FBB03B]',
      glow: 'shadow-[0_0_20px_rgba(255,107,53,0.5)]',
    },
    cyan: {
      bg: 'bg-gradient-to-r from-havana-cyan to-havana-cyan-light',
      glow: 'shadow-[0_0_20px_rgba(0,217,255,0.5)]',
    },
    pink: {
      bg: 'bg-gradient-to-r from-havana-pink to-havana-pink-light',
      glow: 'shadow-[0_0_20px_rgba(255,0,110,0.5)]',
    },
    purple: {
      bg: 'bg-gradient-to-r from-havana-purple to-havana-purple-light',
      glow: 'shadow-[0_0_20px_rgba(156,39,176,0.5)]',
    },
    green: {
      bg: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    },
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-havana-cyan-light">{label}</span>
        {showPercentage && (
          <span className="text-sm font-bold text-white">{displayPercentage}%</span>
        )}
      </div>
      <div className="w-full h-3 bg-havana-navy-dark/60 rounded-full overflow-hidden border border-havana-cyan/20">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorClasses[color].bg} ${colorClasses[color].glow}`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
    </div>
  )
}
