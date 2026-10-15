interface StatBarProps {
  label: string
  value: number
  color: string
  /** Renders the bar in a warning state when the need is nearly empty. */
  warn?: boolean
}

const SEGMENTS = 10

export function StatBar({ label, value, color, warn }: StatBarProps) {
  const filled = Math.round((value / 100) * SEGMENTS)
  const low = value <= 20

  return (
    <div className={`statbar ${low ? 'statbar--low' : ''}`}>
      <span className="statbar__label">{label}</span>
      <div
        className="statbar__track"
        role="meter"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className="statbar__seg"
            style={{ background: i < filled ? color : 'transparent' }}
          />
        ))}
      </div>
      {warn && low && <span className="statbar__alert">!</span>}
    </div>
  )
}
