import { useCallback, useEffect, useRef, useState } from 'react'
import VideoFeed from './components/VideoFeed.jsx'
import AsciiRenderer from './components/AsciiRenderer.jsx'
import Controls, { CHARSET_PRESETS } from './components/Controls.jsx'
import { imageDataToAscii } from './utils/asciiConverter.js'

function getCharsetValue(charsetId) {
  const p = CHARSET_PRESETS.find((x) => x.id === charsetId)
  return p?.value ?? CHARSET_PRESETS[0].value
}

export default function App() {
  const [cameraOn, setCameraOn] = useState(false)
  const [resolution, setResolution] = useState(80)
  const [charsetId, setCharsetId] = useState('classic')
  const [colorAscii, setColorAscii] = useState(true)
  const [error, setError] = useState(null)

  const videoRef = useRef(null)
  const captureRef = useRef(null)
  const asciiRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(0)

  const settingsRef = useRef({ resolution, charsetId, colorAscii })
  useEffect(() => {
    settingsRef.current = { resolution, charsetId, colorAscii }
  }, [resolution, charsetId, colorAscii])

  const stopStream = useCallback(() => {
    const s = streamRef.current
    if (s) {
      s.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    const v = videoRef.current
    if (v) {
      v.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        await video.play().catch(() => {})
      }
      setCameraOn(true)
    } catch (e) {
      stopStream()
      setCameraOn(false)
      const name = e?.name || 'Error'
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Camera access was denied. Allow the camera in your browser settings and try again.')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('No camera was found on this device.')
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        setError('The camera is already in use or cannot be opened.')
      } else {
        setError(e?.message ? String(e.message) : 'Could not start the camera.')
      }
    }
  }, [stopStream])

  const toggleCamera = useCallback(() => {
    if (cameraOn) {
      stopStream()
      setCameraOn(false)
      setError(null)
      asciiRef.current?.clear?.()
    } else {
      startCamera()
    }
  }, [cameraOn, startCamera, stopStream])

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  useEffect(() => {
    if (!cameraOn) return

    const video = videoRef.current
    const cap = captureRef.current
    const ascii = asciiRef.current
    if (!video || !cap || !ascii) return

    const ctx = cap.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const tick = () => {
      const { resolution: colsSetting, charsetId: cid, colorAscii: color } = settingsRef.current
      const charset = getCharsetValue(cid)

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const vw = video.videoWidth
        const vh = video.videoHeight
        if (vw > 0 && vh > 0) {
          const cols = colsSetting
          const rows = Math.max(
            8,
            Math.round((cols * vh * 0.55) / vw),
          )

          if (cap.width !== cols || cap.height !== rows) {
            cap.width = cols
            cap.height = rows
          }

          ctx.drawImage(video, 0, 0, cols, rows)
          const imageData = ctx.getImageData(0, 0, cols, rows)
          const converted = imageDataToAscii(imageData, charset, color)
          ascii.draw({ ...converted, charset })
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [cameraOn])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Artiscii</h1>
        <p className="app-tagline">Live webcam → ASCII</p>
      </header>

      <Controls
        cameraOn={cameraOn}
        onToggleCamera={toggleCamera}
        resolution={resolution}
        onResolutionChange={setResolution}
        charsetId={charsetId}
        onCharsetChange={setCharsetId}
        colorAscii={colorAscii}
        onColorAsciiChange={setColorAscii}
        disabledStart={!navigator.mediaDevices?.getUserMedia}
      />

      <main className="stage">
        <section className="panel" aria-label="Camera feed">
          <span className="panel-label">Video</span>
          {!cameraOn && !error && (
            <p className="placeholder">Start the camera to see your feed here.</p>
          )}
          {error && <p className="placeholder placeholder-error">{error}</p>}
          <VideoFeed ref={videoRef} active={cameraOn} className="video-el" />
        </section>

        <section className="panel" aria-label="ASCII output">
          <span className="panel-label">ASCII</span>
          {!cameraOn && (
            <p className="placeholder">ASCII output appears here when the camera is on.</p>
          )}
          <AsciiRenderer ref={asciiRef} colorMode={colorAscii} />
        </section>
      </main>

      <canvas ref={captureRef} width={160} height={90} hidden aria-hidden />

      {!navigator.mediaDevices?.getUserMedia && (
        <p className="placeholder placeholder-error" style={{ padding: '1rem 1.25rem' }}>
          This browser does not support camera access (getUserMedia).
        </p>
      )}
    </div>
  )
}
