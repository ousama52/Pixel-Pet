import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActionButton } from './ActionButton'
import { PetStage } from './PetStage'
import { SettingsPanel } from './SettingsPanel'
import { SpeechBubble } from './SpeechBubble'
import { StatBar } from './StatBar'
import { ICONS } from '../characters/icons'
import {
  STAGE_NAMES,
  STAGE_THRESHOLDS,
  getCharacter,
  randomLine,
} from '../characters/characterData'
import {
  HEAL_COOLDOWN_MS,
  moodOf,
  useGameStore,
  type EventKind,
  type Pet,
} from '../state/useGameStore'
import { playClip, playSynth, speak } from '../sound/sounds'

const BUBBLE_MS = 3600
const IDLE_CHATTER_MS = 13_000

/** Gentle nudges shown when a need has bottomed out — never a punishment. */
const NUDGES: { key: keyof Pet['stats']; text: string }[] = [
  { key: 'hunger', text: 'is very hungry' },
  { key: 'energy', text: 'is exhausted' },
  { key: 'hygiene', text: 'needs a wash' },
  { key: 'happiness', text: 'is bored' },
]

/** The body font is small-caps, so spell the unit out rather than using m/h/d. */
function formatAge(bornAt: number): string {
  const mins = Math.floor((Date.now() - bornAt) / 60_000)
  if (mins < 60) return `${mins} min old`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr old`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} old`
}

export function GameScreen() {
  const pet = useGameStore((s) => s.pet)!
  const event = useGameStore((s) => s.event)
  const tick = useGameStore((s) => s.tick)
  const goTitle = useGameStore((s) => s.goTitle)
  const { feed, play, clean, toggleSleep, heal } = useGameStore.getState()

  const [bubble, setBubble] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const bubbleTimer = useRef(0)
  const wasSick = useRef(false)

  const def = useMemo(() => getCharacter(pet.characterId), [pet.characterId])
  const mood = moodOf(pet)

  // One heartbeat drives both stat decay and the heal-cooldown readout.
  useEffect(() => {
    const id = window.setInterval(() => {
      tick()
      setNow(Date.now())
    }, 1000)
    return () => window.clearInterval(id)
  }, [tick])

  const say = useCallback((text: string, withVoice = true) => {
    setBubble(text)
    if (withVoice) speak(text)
    window.clearTimeout(bubbleTimer.current)
    bubbleTimer.current = window.setTimeout(() => setBubble(null), BUBBLE_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(bubbleTimer.current), [])

  // React to whatever the store says just happened.
  useEffect(() => {
    if (!event) return
    const kind: EventKind['type'] = event.type

    switch (kind) {
      case 'feed':
        playClip('feed')
        say(randomLine(def.lines.feed))
        break
      case 'play':
        playClip('play')
        playSynth('happy')
        say(randomLine(def.lines.play))
        break
      case 'clean':
        playClip('clean')
        say(randomLine(def.lines.clean))
        break
      case 'sleep':
        playClip('sleep')
        say(randomLine(def.lines.sleep))
        break
      case 'wake':
        playClip('wake')
        say(randomLine(def.lines.wake))
        break
      case 'heal':
        playClip('heal')
        say(randomLine(def.lines.heal))
        break
      case 'evolve':
        playClip('evolve')
        say(randomLine(def.lines.evolve))
        break
      case 'refuse':
        playSynth('refuse')
        say('no thanks!', false)
        break
    }
    // `say` and `def` are stable for the life of a pet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  // A one-off sting the moment the pet actually falls ill.
  useEffect(() => {
    const sick = mood === 'sick'
    if (sick && !wasSick.current) playClip('sick')
    wasSick.current = sick
  }, [mood])

  // Idle chatter: a nudge if something is empty, otherwise a personality line.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (bubble || pet.sleeping) return
      const empty = NUDGES.find((n) => pet.stats[n.key] <= 0)
      if (empty) say(randomLine(def.lines.sad))
      else if (Math.random() < 0.6) say(randomLine(def.lines.idle))
    }, IDLE_CHATTER_MS)
    return () => window.clearInterval(id)
  }, [bubble, pet.sleeping, pet.stats, def, say])

  const healRemaining = Math.max(0, HEAL_COOLDOWN_MS - (now - pet.lastHealAt))
  const healCooldown = healRemaining / HEAL_COOLDOWN_MS
  const nudge = NUDGES.find((n) => pet.stats[n.key] <= 0)

  const nextThreshold = STAGE_THRESHOLDS[pet.stage + 1]
  const growth =
    nextThreshold === undefined
      ? 1
      : Math.min(
          1,
          (pet.careHours - STAGE_THRESHOLDS[pet.stage]) /
            (nextThreshold - STAGE_THRESHOLDS[pet.stage]),
        )

  return (
    <div className="screen game" style={{ '--accent': def.color } as React.CSSProperties}>
      <header className="game__head">
        <div>
          <h2 className="game__name">{pet.name}</h2>
          <p className="game__meta">
            {STAGE_NAMES[pet.stage]} {def.species} · {formatAge(pet.bornAt)}
          </p>
        </div>
        <div className="game__head-btns">
          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              playClip('click')
              setShowSettings(true)
            }}
            aria-label="Settings"
          >
            ⚙
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              playClip('back')
              goTitle()
            }}
            aria-label="Back to title"
          >
            ⌂
          </button>
        </div>
      </header>

      <div className="game__world">
        <SpeechBubble text={bubble} />
        <PetStage pet={pet} def={def} mood={mood} event={event} size={168} />
      </div>

      {mood === 'sick' && (
        <p className="banner banner--sick">{pet.name} feels poorly — try some medicine</p>
      )}
      {mood !== 'sick' && nudge && (
        <p className="banner">
          {pet.name} {nudge.text}
        </p>
      )}

      <div className="stats">
        <StatBar label="Hunger" value={pet.stats.hunger} color="#ff9f68" warn />
        <StatBar label="Happy" value={pet.stats.happiness} color="#ffd166" warn />
        <StatBar label="Energy" value={pet.stats.energy} color="#8bd3ff" warn />
        <StatBar label="Clean" value={pet.stats.hygiene} color="#a9e5bb" warn />
        <StatBar label="Health" value={pet.stats.health} color="#ff8fa3" />
      </div>

      <div className="growth">
        <span className="growth__label">
          {nextThreshold === undefined
            ? 'fully grown!'
            : `growing → ${STAGE_NAMES[pet.stage + 1]}`}
        </span>
        <div className="growth__track">
          <div className="growth__fill" style={{ width: `${growth * 100}%` }} />
        </div>
      </div>

      <div className="actions">
        <ActionButton
          icon={ICONS.apple}
          label="Feed"
          accent="#ff9f68"
          onClick={feed}
          disabled={pet.sleeping}
        />
        <ActionButton
          icon={ICONS.lute}
          label="Play"
          accent="#ffd166"
          onClick={play}
          disabled={pet.sleeping}
        />
        <ActionButton
          icon={ICONS.brush}
          label="Clean"
          accent="#a9e5bb"
          onClick={clean}
          disabled={pet.sleeping}
        />
        <ActionButton
          icon={ICONS.bed}
          label={pet.sleeping ? 'Wake' : 'Sleep'}
          accent="#8bd3ff"
          onClick={toggleSleep}
        />
        <ActionButton
          icon={ICONS.potion}
          label="Heal"
          accent="#ff8fa3"
          onClick={heal}
          disabled={pet.sleeping || healRemaining > 0}
          cooldown={healCooldown}
        />
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}
