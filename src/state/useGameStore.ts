import { create } from 'zustand'
import {
  BASE_DECAY,
  STAGE_THRESHOLDS,
  getCharacter,
  type Stage,
  type StatKey,
} from '../characters/characterData'

export const SAVE_KEY = 'pixelpet.save.v1'

/** Returning after a long break shouldn't mean coming back to a wrecked pet. */
const MAX_OFFLINE_HOURS = 8

export type Screen = 'title' | 'select' | 'game'

export interface Stats {
  hunger: number
  happiness: number
  energy: number
  hygiene: number
  health: number
}

export type Mood = 'sleeping' | 'sick' | 'sad' | 'content' | 'happy'

export interface Pet {
  characterId: string
  name: string
  stats: Stats
  /** Hours of good care banked so far; drives evolution. */
  careHours: number
  stage: Stage
  sleeping: boolean
  bornAt: number
  lastTick: number
  lastHealAt: number
}

interface Settings {
  muted: boolean
  voice: boolean
}

/** What just happened, so the UI can play the matching animation. */
export type EventKind =
  | { type: 'feed'; food: string }
  | { type: 'play' }
  | { type: 'clean' }
  | { type: 'sleep' }
  | { type: 'wake' }
  | { type: 'heal' }
  | { type: 'evolve'; stage: Stage }
  | { type: 'refuse' }

interface GameState {
  screen: Screen
  pet: Pet | null
  settings: Settings
  /** Bumped every time an action fires; components watch it to trigger effects. */
  event: (EventKind & { id: number }) | null

  hasSave: () => boolean
  goTitle: () => void
  goSelect: () => void
  continueGame: () => void
  adopt: (characterId: string, name: string) => void

  tick: () => void
  feed: () => void
  play: () => void
  clean: () => void
  toggleSleep: () => void
  heal: () => void

  setMuted: (muted: boolean) => void
  setVoice: (voice: boolean) => void
  resetSave: () => void
}

const clamp = (n: number) => Math.max(0, Math.min(100, n))

const FRESH_STATS: Stats = {
  hunger: 80,
  happiness: 80,
  energy: 90,
  hygiene: 85,
  health: 100,
}

export const HEAL_COOLDOWN_MS = 45_000

/** Icon keys in src/assets/icons that count as food. */
export const FOODS = ['apple', 'orange', 'melon', 'banana', 'berry', 'sushi', 'donut', 'cake']

// ---------------------------------------------------------------- persistence

function loadSave(): { pet: Pet | null; settings: Settings } {
  const fallback = { pet: null, settings: { muted: false, voice: true } }
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as { pet?: Pet; settings?: Partial<Settings> }
    const pet = parsed.pet ?? null
    // A save written by an older build might point at a character we no longer ship.
    if (pet) getCharacter(pet.characterId)
    return {
      pet,
      settings: { ...fallback.settings, ...parsed.settings },
    }
  } catch {
    return fallback
  }
}

function persist(state: Pick<GameState, 'pet' | 'settings'>) {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ pet: state.pet, settings: state.settings }),
    )
  } catch {
    // Private-browsing / quota — the game still plays, it just won't remember.
  }
}

// ------------------------------------------------------------------ mechanics

export function moodOf(pet: Pet): Mood {
  if (pet.sleeping) return 'sleeping'
  if (pet.stats.health < 30) return 'sick'
  const { hunger, happiness, energy, hygiene } = pet.stats
  if (hunger === 0 || happiness === 0 || energy === 0 || hygiene === 0) return 'sad'
  const avg = (hunger + happiness + energy + hygiene) / 4
  if (avg < 35) return 'sad'
  if (avg > 70) return 'happy'
  return 'content'
}

export function careAverage(stats: Stats): number {
  return (stats.hunger + stats.happiness + stats.energy + stats.hygiene) / 4
}

export function stageFor(careHours: number): Stage {
  let stage: Stage = 0
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (careHours >= STAGE_THRESHOLDS[i]) stage = i as Stage
  }
  return stage
}

/**
 * Advances a pet by `hours`. Pure so it works identically for the live 1s tick
 * and for the catch-up run on load after the tab has been closed.
 */
export function advance(pet: Pet, hours: number): Pet {
  if (hours <= 0) return pet
  const def = getCharacter(pet.characterId)
  const stats = { ...pet.stats }

  // Sleeping slows the other needs right down and refills energy fast.
  const drainScale = pet.sleeping ? 0.3 : 1
  for (const key of ['hunger', 'happiness', 'hygiene'] as StatKey[]) {
    stats[key] = clamp(stats[key] - BASE_DECAY[key] * def.decay[key] * hours * drainScale)
  }
  stats.energy = pet.sleeping
    ? clamp(stats.energy + 60 * hours)
    : clamp(stats.energy - BASE_DECAY.energy * def.decay.energy * hours)

  // Health follows the other four rather than being poked directly.
  const neglected = (['hunger', 'happiness', 'energy', 'hygiene'] as StatKey[]).filter(
    (k) => stats[k] <= 0,
  ).length
  const avg = careAverage(stats)
  // Deliberately gentle: a workday away should leave the pet grumpy and a bit
  // unwell, not flat on zero. Healing is cheap, so this stays low-stakes.
  if (neglected > 0) stats.health = clamp(stats.health - (5 + 4 * neglected) * hours)
  else if (avg < 25) stats.health = clamp(stats.health - 6 * hours)
  else if (avg > 55) stats.health = clamp(stats.health + 12 * hours)

  // Good care banks progress toward the next evolution; poor care banks nothing.
  const quality = Math.max(0, (avg - 40) / 60) // 0 at avg<=40, 1 at avg=100
  const careHours = pet.careHours + hours * quality * def.growthRate

  return { ...pet, stats, careHours, stage: stageFor(careHours) }
}

// --------------------------------------------------------------------- store

const initial = loadSave()

let eventId = 0

export const useGameStore = create<GameState>()((set, get) => {
  /** Applies a state patch to the pet and writes the save. */
  const commit = (pet: Pet | null, event?: EventKind) => {
    const settings = get().settings
    persist({ pet, settings })
    set({ pet, ...(event ? { event: { ...event, id: ++eventId } } : {}) })
  }

  /** Brings the pet up to date before an action is applied to it. */
  const current = (): Pet | null => {
    const pet = get().pet
    if (!pet) return null
    const now = Date.now()
    const hours = Math.min((now - pet.lastTick) / 3_600_000, MAX_OFFLINE_HOURS)
    return { ...advance(pet, hours), lastTick: now }
  }

  return {
    screen: 'title',
    pet: initial.pet,
    settings: initial.settings,
    event: null,

    hasSave: () => get().pet !== null,
    goTitle: () => set({ screen: 'title' }),
    goSelect: () => set({ screen: 'select' }),

    continueGame: () => {
      const prev = get().pet
      const pet = current()
      if (!pet || !prev) return
      // Growing up while the tab was closed still deserves the fanfare.
      commit(pet, pet.stage > prev.stage ? { type: 'evolve', stage: pet.stage } : undefined)
      set({ screen: 'game' })
    },

    adopt: (characterId, name) => {
      const now = Date.now()
      const pet: Pet = {
        characterId,
        name: name.trim() || getCharacter(characterId).name,
        stats: { ...FRESH_STATS },
        careHours: 0,
        stage: 0,
        sleeping: false,
        bornAt: now,
        lastTick: now,
        lastHealAt: 0,
      }
      commit(pet)
      set({ screen: 'game' })
    },

    tick: () => {
      const pet = current()
      if (!pet) return
      const prev = get().pet!
      if (pet.stage > prev.stage) {
        commit(pet, { type: 'evolve', stage: pet.stage })
      } else {
        // Frequent, silent — don't re-write localStorage on every single second.
        set({ pet })
        if (Math.floor(pet.lastTick / 5000) !== Math.floor(prev.lastTick / 5000)) {
          persist({ pet, settings: get().settings })
        }
      }
    },

    feed: () => {
      const pet = current()
      if (!pet) return
      if (pet.sleeping || pet.stats.hunger >= 97) return commit(pet, { type: 'refuse' })
      const food = FOODS[Math.floor(Math.random() * FOODS.length)]
      commit(
        {
          ...pet,
          stats: {
            ...pet.stats,
            hunger: clamp(pet.stats.hunger + 26),
            happiness: clamp(pet.stats.happiness + 4),
          },
        },
        { type: 'feed', food },
      )
    },

    play: () => {
      const pet = current()
      if (!pet) return
      if (pet.sleeping || pet.stats.energy <= 8) return commit(pet, { type: 'refuse' })
      commit(
        {
          ...pet,
          stats: {
            ...pet.stats,
            happiness: clamp(pet.stats.happiness + 24),
            energy: clamp(pet.stats.energy - 9),
            hunger: clamp(pet.stats.hunger - 5),
          },
        },
        { type: 'play' },
      )
    },

    clean: () => {
      const pet = current()
      if (!pet) return
      if (pet.sleeping || pet.stats.hygiene >= 97) return commit(pet, { type: 'refuse' })
      commit(
        {
          ...pet,
          stats: {
            ...pet.stats,
            hygiene: clamp(pet.stats.hygiene + 38),
            happiness: clamp(pet.stats.happiness + 3),
          },
        },
        { type: 'clean' },
      )
    },

    toggleSleep: () => {
      const pet = current()
      if (!pet) return
      const sleeping = !pet.sleeping
      commit({ ...pet, sleeping }, { type: sleeping ? 'sleep' : 'wake' })
    },

    heal: () => {
      const pet = current()
      if (!pet) return
      const ready = Date.now() - pet.lastHealAt >= HEAL_COOLDOWN_MS
      if (!ready || pet.sleeping || pet.stats.health >= 99) {
        return commit(pet, { type: 'refuse' })
      }
      commit(
        {
          ...pet,
          stats: { ...pet.stats, health: clamp(pet.stats.health + 45) },
          lastHealAt: Date.now(),
        },
        { type: 'heal' },
      )
    },

    setMuted: (muted) => {
      const settings = { ...get().settings, muted }
      set({ settings })
      persist({ pet: get().pet, settings })
    },

    setVoice: (voice) => {
      const settings = { ...get().settings, voice }
      set({ settings })
      persist({ pet: get().pet, settings })
    },

    resetSave: () => {
      try {
        localStorage.removeItem(SAVE_KEY)
      } catch {
        /* nothing to clear */
      }
      set({ pet: null, screen: 'title', event: null })
    },
  }
})
