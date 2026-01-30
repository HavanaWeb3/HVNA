'use client'

import { useState, useRef } from 'react'

interface VideoPlayerProps {
  src: string
  thumbnail?: string
  autoPlay?: boolean
  controls?: boolean
  className?: string
}

/**
 * Video Player Component
 *
 * A simple video player wrapper for displaying uploaded videos.
 */
export function VideoPlayer({
  src,
  thumbnail,
  autoPlay = false,
  controls = true,
  className = ''
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [showThumbnail, setShowThumbnail] = useState(!!thumbnail && !autoPlay)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    setShowThumbnail(false)
    setIsPlaying(true)
    videoRef.current?.play()
  }

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {showThumbnail && thumbnail ? (
        <div
          className="relative cursor-pointer group"
          onClick={handlePlay}
        >
          <img
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8 text-gray-900 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          controls={controls}
          autoPlay={autoPlay}
          onClick={handleVideoClick}
          className="w-full h-full"
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}

export default VideoPlayer
