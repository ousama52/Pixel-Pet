import { SHEET } from './characterData'
import { useFrameIndex } from './useFrameIndex'

export interface SpriteProps {
  sheet: string
  /** Evolution stage = the row to sample from the sheet. */
  stage: number
  /** Rendered edge length in CSS pixels. */
  size: number
  /** Idle animation speed. */
  fps?: number
  playing?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * Renders one tile of a packed sprite sheet by stepping `background-position`,
 * exactly like a classic CSS sprite animation. Nothing is drawn in code —
 * the pixels come from the downloaded PNG.
 */
export function SpriteAnimator({
  sheet,
  stage,
  size,
  fps = 3,
  playing = true,
  className,
  style,
}: SpriteProps) {
  const frame = useFrameIndex(SHEET.frames, fps, playing)

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sheet})`,
        backgroundSize: `${size * SHEET.frames}px ${size * SHEET.stages}px`,
        backgroundPosition: `${-frame * size}px ${-stage * size}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  )
}

/** A single non-animated pixel icon (food, potion, bed...). */
export function PixelIcon({
  src,
  size,
  className,
  style,
}: {
  src: string
  size: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated', display: 'block', ...style }}
    />
  )
}
