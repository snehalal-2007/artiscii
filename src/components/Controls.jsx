export const CHARSET_PRESETS = [
  { id: 'classic', label: 'Classic (@#%*+=-:. )', value: '@#%*+=-:. ' },
  { id: 'inverse', label: 'Inverse ( .:-=+*#%@)', value: ' .:-=+*#%@' },
  { id: 'blocks', label: 'Blocks (█▓▒░ )', value: '█▓▒░ ' },
  { id: 'minimal', label: 'Minimal (@:.)', value: '@:.' },
  { id: 'dense', label: 'Dense (█@%#*+=-:. )', value: '█@%#*+=-:. ' },
]

export default function Controls({
  cameraOn,
  onToggleCamera,
  resolution,
  onResolutionChange,
  charsetId,
  onCharsetChange,
  colorAscii,
  onColorAsciiChange,
  disabledStart,
}) {
  return (
    <div className="controls" role="toolbar" aria-label="Artiscii controls">
      <div className="control">
        <span className="control-label">Camera</span>
        <div className="control-row">
          <button
            type="button"
            className={`btn ${cameraOn ? '' : 'btn-primary'}`}
            onClick={onToggleCamera}
            disabled={!cameraOn && disabledStart}
          >
            {cameraOn ? 'Stop camera' : 'Start camera'}
          </button>
        </div>
      </div>

      <div className="control">
        <span className="control-label" id="res-label">
          ASCII resolution ({resolution} cols)
        </span>
        <div className="control-row">
          <input
            type="range"
            className="slider"
            min={32}
            max={160}
            step={4}
            value={resolution}
            onChange={(e) => onResolutionChange(Number(e.target.value))}
            aria-labelledby="res-label"
          />
        </div>
      </div>

      <div className="control">
        <span className="control-label" id="charset-label">
          Character set
        </span>
        <div className="control-row">
          <select
            className="select"
            value={charsetId}
            onChange={(e) => onCharsetChange(e.target.value)}
            aria-labelledby="charset-label"
          >
            {CHARSET_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="control">
        <span className="control-label">Mode</span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={colorAscii}
            onChange={(e) => onColorAsciiChange(e.target.checked)}
          />
          <span>Pastel colors</span>
        </label>
      </div>
    </div>
  )
}
