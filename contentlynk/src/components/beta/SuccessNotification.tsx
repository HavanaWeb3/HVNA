'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { notificationSlide } from '@/lib/animations'

interface SuccessNotificationProps {
  show: boolean
  message: string
  onClose?: () => void
}

export function SuccessNotification({ show, message, onClose }: SuccessNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={notificationSlide}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-4 left-1/2 z-[200] px-6 py-3 bg-emerald-500 text-white rounded-full shadow-lg flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
