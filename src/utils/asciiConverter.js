/**
 * Luminance in [0, 1]; 0 = black, 1 = white (sRGB-ish).
 */
export function getLuminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/**
 * Charset ordered dark → light: index 0 = darkest glyph, last = lightest.
 */
export function luminanceToCharIndex(lum, charset) {
  const n = charset.length
  if (n <= 1) return 0
  const t = Math.min(1, Math.max(0, lum))
  return Math.min(n - 1, Math.floor(t * (n - 1)))
}

export function charForRgb(r, g, b, charset) {
  const lum = getLuminance(r, g, b)
  const idx = luminanceToCharIndex(lum, charset)
  return charset[idx] ?? ' '
}

/**
 * @param {ImageData} imageData small grid (cols x rows)
 * @param {string} charset
 * @param {boolean} colorMode when true, skips building mono string (saves work if only color is shown)
 * @returns {{ monoLines: string[], cols: number, rows: number, imageData: ImageData }}
 */
function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h, s, l]
}

function hslToRgb(h, s, l) {
  let r
  let g
  let b

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const hue2rgb = (p1, q1, t) => {
      let tt = t
      if (tt < 0) tt += 1
      if (tt > 1) tt -= 1
      if (tt < 1 / 6) return p1 + (q1 - p1) * 6 * tt
      if (tt < 1 / 2) return q1
      if (tt < 2 / 3) return p1 + (q1 - p1) * (2 / 3 - tt) * 6
      return p1
    }
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [
    Math.round(Math.min(255, Math.max(0, r * 255))),
    Math.round(Math.min(255, Math.max(0, g * 255))),
    Math.round(Math.min(255, Math.max(0, b * 255))),
  ]
}

/**
 * Map captured RGB to a soft pastel (keeps hue roughly, lowers saturation, raises lightness).
 */
export function rgbToPastel(r, g, b) {
  let [h, s, l] = rgbToHsl(r, g, b)
  const satBoost = 0.18 + s * 0.42
  s = Math.min(0.52, Math.max(0.12, satBoost))
  const lightLift = 0.74 + l * 0.17
  l = Math.min(0.93, Math.max(0.7, lightLift))
  return hslToRgb(h, s, l)
}

export function imageDataToAscii(imageData, charset, colorMode) {
  const { width: cols, height: rows, data } = imageData
  const monoLines = colorMode ? [] : new Array(rows)

  if (!colorMode) {
    for (let y = 0; y < rows; y++) {
      let line = ''
      const rowOff = y * cols * 4
      for (let x = 0; x < cols; x++) {
        const i = rowOff + x * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        line += charForRgb(r, g, b, charset)
      }
      monoLines[y] = line
    }
  }

  return { monoLines, cols, rows, imageData }
}
