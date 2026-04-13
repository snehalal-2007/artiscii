import { forwardRef } from 'react'

const VideoFeed = forwardRef(function VideoFeed({ active, className }, ref) {
  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      playsInline
      muted
      style={{ visibility: active ? 'visible' : 'hidden' }}
    />
  )
})

export default VideoFeed
