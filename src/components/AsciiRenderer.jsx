import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { charForRgb, rgbToPastel } from '../utils/asciiConverter.js'

const BASE_FONT = '10px ui-monospace, Menlo, Monaco, Consolas, monospace'

const AsciiRenderer = forwardRef(function AsciiRenderer({ colorMode }, ref) {
  const preRef = useRef(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    ctxRef.current = canvas.getContext('2d', { alpha: false })
    const ctx = ctxRef.current
    if (ctx) {
      ctx.textBaseline = 'top'
    }
  }, [])

  useImperativeHandle(ref, () => ({
    clear() {
      const pre = preRef.current
      if (pre) pre.textContent = ''
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (canvas && ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    },
    /**
     * @param {{ monoLines: string[], cols: number, rows: number, imageData: ImageData, charset: string }} frame
     */
    draw(frame) {
      if (!frame) return
      const { monoLines, cols, rows, imageData, charset } = frame

      if (!colorMode) {
        const pre = preRef.current
        if (pre) {
          pre.textContent = monoLines.join('\n')
        }
        return
      }

      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!canvas || !ctx) return

      const parent = canvas.parentElement
      const pw = parent?.clientWidth || 320
      const ph = parent?.clientHeight || 240

      const measure = document.createElement('canvas')
      const mctx = measure.getContext('2d')
      if (!mctx) return
      mctx.font = BASE_FONT
      const baseW = mctx.measureText('@').width || 6
      const baseH = 12

      const scale = Math.min(pw / (cols * baseW), ph / (rows * baseH), 2.5)
      const fontPx = Math.max(6, Math.floor(10 * scale))
      const font = `${fontPx}px ui-monospace, Menlo, Monaco, Consolas, monospace`

      mctx.font = font
      const charW = Math.max(4, mctx.measureText('@').width)
      const charH = Math.max(fontPx + 2, fontPx * 1.2)

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const bufW = Math.max(1, Math.ceil(cols * charW))
      const bufH = Math.max(1, Math.ceil(rows * charH))

      const needW = Math.floor(bufW * dpr)
      const needH = Math.floor(bufH * dpr)
      if (canvas.width !== needW || canvas.height !== needH) {
        canvas.width = needW
        canvas.height = needH
        canvas.style.width = `${bufW}px`
        canvas.style.height = `${bufH}px`
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = font
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, bufW, bufH)

      const pix = imageData.data
      const w = imageData.width
      for (let y = 0; y < rows; y++) {
        const row = y * w * 4
        for (let x = 0; x < cols; x++) {
          const i = row + x * 4
          const r = pix[i]
          const g = pix[i + 1]
          const b = pix[i + 2]
          const ch = charForRgb(r, g, b, charset)
          const [pr, pg, pb] = rgbToPastel(r, g, b)
          ctx.fillStyle = `rgb(${pr},${pg},${pb})`
          ctx.fillText(ch, x * charW, y * charH)
        }
      }
    },
  }))

  return (
    <>
      <pre
        ref={preRef}
        className="ascii-pre"
        style={{ display: colorMode ? 'none' : 'block' }}
        aria-hidden={colorMode}
      />
      <canvas
        ref={canvasRef}
        className="ascii-canvas"
        style={{ display: colorMode ? 'block' : 'none' }}
        aria-hidden={!colorMode}
      />
    </>
  )
})

export default AsciiRenderer
