import { PixelIcon } from '../characters/SpriteAnimator'

interface ActionButtonProps {
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
  /** 0..1 remaining cooldown, drawn as a sweep across the button face. */
  cooldown?: number
  accent: string
}

export function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  cooldown = 0,
  accent,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className="action"
      onClick={onClick}
      disabled={disabled}
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {cooldown > 0 && (
        <span className="action__cooldown" style={{ height: `${cooldown * 100}%` }} />
      )}
      <PixelIcon src={icon} size={32} className="action__icon" />
      <span className="action__label">{label}</span>
    </button>
  )
}
