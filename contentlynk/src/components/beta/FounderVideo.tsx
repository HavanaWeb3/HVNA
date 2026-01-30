'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { playButtonHover } from '@/lib/animations'

// Dynamically import ReactPlayer to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

interface FounderVideoProps {
  videoUrl?: string
  thumbnailUrl?: string
  duration?: string
  title?: string
  description?: string
}

export function FounderVideo({
  videoUrl = 'https://www.youtube.com/watch?v=placeholder', // Placeholder URL
  thumbnailUrl = '/images/founder/david-founder-medium.jpg',
  duration = '2:30',
  title = 'Message from Our Founder',
  description = "Thank you for being part of the revolution. Here's what we're building and why your early belief matters...",
}: FounderVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    setHasStarted(true)
    // Track play event for analytics
    if (typeof window !== 'undefined') {
      console.log('[Analytics] Founder video play started')
    }
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleReady = useCallback(() => {
    setIsReady(true)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsPlaying(false)
  }, [])

  const handleProgress = useCallback((state: { played: number }) => {
    setProgress(state.played * 100)
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    // Track completion for analytics
    if (typeof window !== 'undefined') {
      console.log('[Analytics] Founder video completed')
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!hasStarted) {
      handlePlay()
    } else {
      setIsPlaying(!isPlaying)
    }
  }, [hasStarted, isPlaying, handlePlay])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value) / 100
    playerRef.current?.seekTo(seekTo)
    setProgress(parseFloat(e.target.value))
  }, [])

  return (
    <section
      className="bg-havana-navy-light/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-havana-pink/30 overflow-hidden"
      aria-label="Founder video message"
    >
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="Video camera">🎬</span>
        {title}
      </h2>

      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden bg-black aspect-video"
      >
        {/* Thumbnail with play button overlay */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10"
            >
              {/* Thumbnail image */}
              <div className="absolute inset-0">
                <Image
                  src={thumbnailUrl}
                  alt="Video thumbnail - David Sime, Founder"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/90 text-sm md:text-base mb-4 max-w-lg">
                  {description}
                </p>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>{duration} video</span>
                </div>
              </div>

              {/* Play button */}
              <motion.button
                variants={playButtonHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={handlePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-[#FF6B35] to-[#FBB03B] rounded-full flex items-center justify-center shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/50"
                aria-label="Play video"
              >
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-havana-navy-dark/90 z-20">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">😕</div>
              <p className="text-white mb-2">Video unavailable</p>
              <p className="text-havana-cyan-light text-sm">
                The founder video will be available soon.
              </p>
              <button
                onClick={() => {
                  setHasError(false)
                  setHasStarted(false)
                }}
                className="mt-4 px-4 py-2 bg-havana-cyan/20 text-havana-cyan rounded-lg hover:bg-havana-cyan/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Video player */}
        {hasStarted && !hasError && (
          <div className="absolute inset-0">
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              playing={isPlaying}
              muted={isMuted}
              volume={volume}
              width="100%"
              height="100%"
              onReady={handleReady}
              onError={handleError}
              onProgress={handleProgress}
              onEnded={handleEnded}
              onPause={handlePause}
              onPlay={() => setIsPlaying(true)}
              config={{
                youtube: {
                  playerVars: { modestbranding: 1 },
                },
              }}
            />

            {/* Custom controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
              {/* Progress bar */}
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 mb-3 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                aria-label="Video progress"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-havana-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-havana-cyan rounded"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-havana-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-havana-cyan rounded"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                      aria-label="Volume"
                    />
                  </div>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-havana-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-havana-cyan rounded"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm2 6a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v3a1 1 0 01-2 0V4zm10-1a1 1 0 100 2h3v3a1 1 0 102 0V4a1 1 0 00-1-1h-4zM4 13a1 1 0 011 1v2h3a1 1 0 110 2H4a1 1 0 01-1-1v-3a1 1 0 011-1zm13 1a1 1 0 10-2 0v2h-3a1 1 0 100 2h4a1 1 0 001-1v-3z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {hasStarted && !isReady && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-15">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-havana-cyan border-t-transparent" />
          </div>
        )}
      </div>
    </section>
  )
}
