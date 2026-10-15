import { useEffect, useRef, useState } from 'react'
import { PixelIcon, SpriteAnimator } from '../characters/SpriteAnimator'
import { ICONS } from '../characters/icons'
import type { CharacterDef } from '../characters/characterData'
import type { EventKind, Mood, Pet } from '../state/useGameStore'

interface Particle {
  id: number
  kind: 'icon' | 'text'
  content: string
  /** Horizontal offset from centre, in pixels. */
  x: number
  delay: number
}

interface PetStageProps {
  pet: Pet
  def: CharacterDef
  mood: Mood
  event: (EventKind & { id: number }) | null
  size: number
}

/** Which one-shot body animation an event plays. */
const EVENT_ANIM: Partial<Record<EventKind['type'], string>> = {
  feed: 'pet--munch',
  play: 'pet--hop',
  clean: 'pet--shine',
  heal: 'pet--pulse',
  evolve: 'pet--evolve',
  refuse: 'pet--shake',
}

/** Particles thrown up by each event: [kind, contents]. */
const EVENT_PARTICLES: Partial<Record<EventKind['type'], [Particle['kind'], string[]]>> = {
  play: ['text', ['♥', '♪', '♥']],
  clean: ['text', ['✦', '✧', '✦', '✧']],
  heal: ['icon', ['potion']],
  evolve: ['text', ['✦', '★', '✦', '★', '✦']],
}

let particleId = 0

export function PetStage({ pet, def, mood, event, size }: PetStageProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const timers = useRef<number[]>([])

  useEffect(
    () => () => {
      for (const t of timers.current) window.clearTimeout(t)
    },
    [],
  )

  useEffect(() => {
    if (!event) return
    const spec: [Particle['kind'], string[]] | undefined =
      event.type === 'feed' ? ['icon', [event.food]] : EVENT_PARTICLES[event.type]
    if (!spec) return

    const [kind, contents] = spec
    const made: Particle[] = contents.map((content, i) => ({
      id: ++particleId,
      kind,
      content,
      x: (i - (contents.length - 1) / 2) * 34 + (Math.random() * 12 - 6),
      delay: i * 0.09,
    }))
    setParticles((p) => [...p, ...made])
    timers.current.push(
      window.setTimeout(
        () => setParticles((p) => p.filter((q) => !made.some((m) => m.id === q.id))),
        1700,
      ),
    )
  }, [event])

  const sleeping = mood === 'sleeping'
  const idleClass = sleeping
    ? 'pet--sleep'
    : mood === 'sad' || mood === 'sick'
      ? 'pet--droop'
      : 'pet--idle'
  // Keying on the event id remounts the wrapper, which restarts its CSS
  // animation cleanly even when the same action is tapped twice in a row.
  const oneShot = event ? EVENT_ANIM[event.type] : undefined

  return (
    <div className="stage" style={{ height: size + 56 }}>
      <div className="stage__shadow" style={{ width: size * 0.55 }} />

      <div className={`pet ${idleClass}`}>
        <div key={event?.id ?? 'idle'} className={oneShot ?? ''}>
          <SpriteAnimator
            sheet={def.sheet}
            stage={pet.stage}
            size={size}
            fps={sleeping ? 1 : mood === 'happy' ? 4 : 2.5}
            className={mood === 'sick' ? 'pet__sprite pet__sprite--sick' : 'pet__sprite'}
          />
        </div>
      </div>

      {sleeping && (
        <div className="zzz" aria-hidden>
          <span>z</span>
          <span>z</span>
          <span>z</span>
        </div>
      )}

      <div className="particles" aria-hidden>
        {particles.map((p) => (
          <span
            key={p.id}
            className={`particle particle--${p.kind}`}
            style={{ left: `calc(50% + ${p.x}px)`, animationDelay: `${p.delay}s` }}
          >
            {p.kind === 'icon' ? <PixelIcon src={ICONS[p.content]} size={28} /> : p.content}
          </span>
        ))}
      </div>
    </div>
  )
}
