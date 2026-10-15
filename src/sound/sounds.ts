import backUrl from '../assets/sounds/back.ogg'
import cleanUrl from '../assets/sounds/clean.ogg'
import clickUrl from '../assets/sounds/click.ogg'
import confirmUrl from '../assets/sounds/confirm.ogg'
import evolveUrl from '../assets/sounds/evolve.ogg'
import feedUrl from '../assets/sounds/feed.ogg'
import hatchUrl from '../assets/sounds/hatch.ogg'
import healUrl from '../assets/sounds/heal.ogg'
import playUrl from '../assets/sounds/play.ogg'
import sickUrl from '../assets/sounds/sick.ogg'
import sleepUrl from '../assets/sounds/sleep.ogg'
import wakeUrl from '../assets/sounds/wake.ogg'

/** Downloaded Kenney CC0 clips — see CREDITS.md. */
const CLIPS = {
  back: backUrl,
  clean: cleanUrl,
  click: clickUrl,
  confirm: confirmUrl,
  evolve: evolveUrl,
  feed: feedUrl,
  hatch: hatchUrl,
  heal: healUrl,
  play: playUrl,
  sick: sickUrl,
  sleep: sleepUrl,
  wake: wakeUrl,
} as const

export type ClipName = keyof typeof CLIPS

/** Blips the downloaded pack doesn't cover, synthesised with Tone.js instead. */
export type SynthName = 'happy' | 'refuse' | 'select'

const VOLUME: Partial<Record<ClipName, number>> = {
  click: 0.35,
  back: 0.35,
  confirm: 0.5,
  evolve: 0.6,
  hatch: 0.5,
}

let muted = false
let voiceOn = true
let unlocked = false

/** Small pool per clip so rapid taps overlap instead of cutting each other off. */
const pools = new Map<ClipName, HTMLAudioElement[]>()
const POOL_SIZE = 3

function pool(name: ClipName): HTMLAudioElement[] {
  let p = pools.get(name)
  if (!p) {
    p = Array.from({ length: POOL_SIZE }, () => {
      const a = new Audio(CLIPS[name])
      a.preload = 'auto'
      a.volume = VOLUME[name] ?? 0.55
      return a
    })
    pools.set(name, p)
  }
  return p
}

export function setMuted(value: boolean) {
  muted = value
  if (muted) {
    for (const p of pools.values()) for (const a of p) a.pause()
    window.speechSynthesis?.cancel()
  }
}

export function setVoiceEnabled(value: boolean) {
  voiceOn = value
  if (!voiceOn) window.speechSynthesis?.cancel()
}

/**
 * Browsers block audio until the user has interacted. Call this from the first
 * click/keypress so both the <audio> pool and Tone's AudioContext are ready.
 */
export function unlockAudio() {
  if (unlocked) return
  unlocked = true
  for (const name of Object.keys(CLIPS) as ClipName[]) pool(name)
}

export function playClip(name: ClipName) {
  if (muted) return
  unlockAudio()
  const p = pool(name)
  const free = p.find((a) => a.paused || a.ended) ?? p[0]
  free.currentTime = 0
  void free.play().catch(() => {
    // Autoplay still blocked — the next gesture-driven call will work.
  })
}

// ------------------------------------------------------- Tone.js fallback blips

type ToneModule = typeof import('tone')
let tonePromise: Promise<ToneModule> | null = null
let synth: import('tone').PolySynth | null = null

/** Tone is ~loud on the bundle, so it only loads the first time a blip is needed. */
async function getSynth() {
  if (!tonePromise) tonePromise = import('tone')
  const Tone = await tonePromise
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.08, sustain: 0.02, release: 0.12 },
      volume: -18,
    }).toDestination()
  }
  if (Tone.getContext().state !== 'running') await Tone.start()
  return { Tone, synth }
}

const SYNTH_PATTERNS: Record<SynthName, { notes: string[]; step: number }> = {
  // Ascending sparkle for a delighted pet.
  happy: { notes: ['C5', 'E5', 'G5', 'C6'], step: 0.06 },
  // Two flat low notes — "no thanks".
  refuse: { notes: ['A3', 'F3'], step: 0.1 },
  // One bright pick blip.
  select: { notes: ['E5'], step: 0 },
}

export function playSynth(name: SynthName) {
  if (muted) return
  void getSynth()
    .then(({ Tone, synth: s }) => {
      if (muted || !s) return
      const { notes, step } = SYNTH_PATTERNS[name]
      const now = Tone.now()
      notes.forEach((note, i) => s.triggerAttackRelease(note, '16n', now + i * step))
    })
    .catch(() => {
      // No Web Audio available; the game is perfectly playable silent.
    })
}

// --------------------------------------------------------- squeaky pet "voice"

let voices: SpeechSynthesisVoice[] = []

function refreshVoices() {
  voices = window.speechSynthesis?.getVoices() ?? []
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
}

/** Tiny high-pitched squeak, e.g. "yay!", "yummy!", "zzz...". */
export function speak(text: string) {
  if (muted || !voiceOn) return
  const synthesis = window.speechSynthesis
  if (!synthesis) return
  synthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.pitch = 1.8
  u.rate = 1.15
  u.volume = 0.75
  const preferred =
    voices.find((v) => v.lang.startsWith('en') && /female|zira|samantha/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith('en'))
  if (preferred) u.voice = preferred
  synthesis.speak(u)
}
