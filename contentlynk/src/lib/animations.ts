import { Variants } from 'framer-motion'

// Staggered fade-in for sections
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

// Card hover effect
export const cardHover: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  hover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// Button press effect
export const buttonTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
}

// Number counter animation (for countdown)
export const numberTransition = {
  type: 'spring',
  stiffness: 100,
  damping: 10,
}

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

// Pulse animation for badges
export const pulse: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
}

// Success notification animation
export const notificationSlide: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    x: '-50%',
  },
  visible: {
    opacity: 1,
    y: 0,
    x: '-50%',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    x: '-50%',
    transition: {
      duration: 0.2,
    },
  },
}

// Video play button animation
export const playButtonHover = {
  rest: {
    scale: 1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
}
