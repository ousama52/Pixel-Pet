import chickSheet from '../assets/characters/chick/sheet.png'
import newtSheet from '../assets/characters/newt/sheet.png'
import catSheet from '../assets/characters/cat/sheet.png'
import dragonSheet from '../assets/characters/dragon/sheet.png'
import penguinSheet from '../assets/characters/penguin/sheet.png'
import ghostSheet from '../assets/characters/ghost/sheet.png'

/** Every sheet is laid out the same way by scripts/export_sprites.py. */
export const SHEET = {
  /** Native pixel size of one sprite tile. */
  tile: 16,
  /** Animation frames across (DawnLike ships two idle frames per creature). */
  frames: 2,
  /** Evolution stages down. */
  stages: 4,
} as const

export const STAGE_NAMES = ['Baby', 'Child', 'Teen', 'Adult'] as const
export type Stage = 0 | 1 | 2 | 3

/** Cumulative hours of *good care* needed to reach each stage. */
export const STAGE_THRESHOLDS = [0, 0.17, 0.75, 2.5] as const

export type StatKey = 'hunger' | 'happiness' | 'energy' | 'hygiene'

/** Points lost per hour at a neutral personality (x1 multiplier). */
export const BASE_DECAY: Record<StatKey, number> = {
  hunger: 26,
  happiness: 22,
  energy: 15,
  hygiene: 13,
}

export interface CharacterDef {
  id: string
  name: string
  species: string
  blurb: string
  /** Pastel accent used for this pet's cards, bars and background wash. */
  color: string
  sheet: string
  /** Per-stat multipliers on BASE_DECAY. Below 1 = this pet is easygoing about it. */
  decay: Record<StatKey, number>
  /** Multiplier on how fast good care accrues toward the next evolution. */
  growthRate: number
  /** How big the pet renders relative to the others, per stage. */
  scale: number
  /** Flavour lines, picked at random for the speech bubble. */
  lines: {
    idle: string[]
    feed: string[]
    play: string[]
    clean: string[]
    sleep: string[]
    wake: string[]
    heal: string[]
    sad: string[]
    evolve: string[]
  }
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'chick',
    name: 'Pip',
    species: 'Sunfluff Chick',
    blurb: 'Never stops bouncing. Burns energy like a tiny sun.',
    color: '#ffd97d',
    sheet: chickSheet,
    decay: { hunger: 1.1, happiness: 1, energy: 1.5, hygiene: 1 },
    growthRate: 1.1,
    scale: 1,
    lines: {
      idle: ['peep peep!', 'is it snack time?', 'I ran laps!', 'chirp chirp chirp'],
      feed: ['yummy!', 'seeds! my favourite!', 'more more more!'],
      play: ['again! again!', 'wheee!', 'I am so fast!'],
      clean: ['fluffy again!', 'shiny feathers!'],
      sleep: ['zzz... peep... zzz'],
      wake: ['good morning!', 'ready to run!'],
      heal: ['all better!', 'phew, thank you'],
      sad: ['peep...?', 'I feel wobbly...'],
      evolve: ['look at my feathers!', 'I got bigger!'],
    },
  },
  {
    id: 'newt',
    name: 'Gribbit',
    species: 'Mossback Newt',
    blurb: 'Extremely chill. Can go all day without a snack.',
    color: '#a8e6a1',
    sheet: newtSheet,
    decay: { hunger: 0.55, happiness: 0.9, energy: 0.85, hygiene: 1.1 },
    growthRate: 0.95,
    scale: 1,
    lines: {
      idle: ['...blub', 'nice puddle today', 'just vibing', 'mmmm damp'],
      feed: ['a bug! lovely', 'tasty', 'slow bites are best'],
      play: ['heh, fun', 'okay one more', 'splash!'],
      clean: ['nice and slimy', 'refreshing'],
      sleep: ['zzz... blub... zzz'],
      wake: ['mmm... morning', 'five more minutes'],
      heal: ['much better', 'thanks friend'],
      sad: ['feeling dry...', 'oh dear...'],
      evolve: ['new skin!', 'bigger tail!'],
    },
  },
  {
    id: 'cat',
    name: 'Momo',
    species: 'Marmalade Cat',
    blurb: 'Loves you loudly. Gets grumpy without playtime.',
    color: '#ffb385',
    sheet: catSheet,
    decay: { hunger: 1, happiness: 1.6, energy: 0.9, hygiene: 0.8 },
    growthRate: 1,
    scale: 1,
    lines: {
      idle: ['mrrp?', 'pet me. now.', 'purrrrr', 'I knocked it over'],
      feed: ['nom nom nom', 'finally!', 'this is acceptable'],
      play: ['GOT IT!', 'again with the string!', 'mrrrow!'],
      clean: ['I was already clean', 'okay that was nice'],
      sleep: ['purr... zzz... purr'],
      wake: ['stretch...', 'mrrp. morning.'],
      heal: ['I feel purrfect', 'okay okay thank you'],
      sad: ['mrow...', 'I am so bored...'],
      evolve: ['bigger paws!', 'look at my stripes!'],
    },
  },
  {
    id: 'dragon',
    name: 'Ember',
    species: 'Cinder Drake',
    blurb: 'Rare and stubborn. Grows slowly, but grows strong.',
    color: '#ff9c8a',
    sheet: dragonSheet,
    decay: { hunger: 1.2, happiness: 0.9, energy: 0.7, hygiene: 0.9 },
    growthRate: 0.55,
    scale: 1,
    lines: {
      idle: ['*smoke puff*', 'one day I will fly', 'rawr. quietly.', 'I am hoarding pebbles'],
      feed: ['crunchy!', 'a worthy meal', 'roar-nom'],
      play: ['I almost flew!', 'again, small human', 'rawr!'],
      clean: ['my scales gleam', 'shiny!'],
      sleep: ['zzz... *smoke*... zzz'],
      wake: ['the drake awakens', 'mmmf... morning'],
      heal: ['my fire returns', 'thank you, keeper'],
      sad: ['my flame is low...', 'rawr...?'],
      evolve: ['MY WINGS!', 'I am magnificent!'],
    },
  },
  {
    id: 'penguin',
    name: 'Waddles',
    species: 'Frostbelly Penguin',
    blurb: 'Sleepy champion. Naps recharge them fast.',
    color: '#a8d8ff',
    sheet: penguinSheet,
    decay: { hunger: 1, happiness: 0.9, energy: 0.5, hygiene: 0.9 },
    growthRate: 0.9,
    scale: 1,
    lines: {
      idle: ['*waddle waddle*', 'is it nap o clock?', 'brrr! lovely.', 'I slid on my belly'],
      feed: ['fish! FISH!', 'gulp!', 'delicious'],
      play: ['sliding is playing', 'wheee, slippy!', 'honk!'],
      clean: ['sleek again', 'ice cold, perfect'],
      sleep: ['zzz... honk... zzz'],
      wake: ['best nap ever', 'ready! ...ish'],
      heal: ['warm inside now', 'thank you'],
      sad: ['honk...', 'too warm...'],
      evolve: ['taller waddle!', 'my belly grew!'],
    },
  },
  {
    id: 'ghost',
    name: 'Boo',
    species: 'Sheet Spook',
    blurb: 'Barely needs washing. Being a ghost has perks.',
    color: '#d6c9ff',
    sheet: ghostSheet,
    decay: { hunger: 0.9, happiness: 1.1, energy: 0.9, hygiene: 0.35 },
    growthRate: 1,
    scale: 1,
    lines: {
      idle: ['boo!', 'did I scare you?', 'oooooo~', 'I floated through a wall'],
      feed: ['spooky snack!', 'it went right through me', 'nom... ooo'],
      play: ['peekaboo!', 'hehehe!', 'I hid in the lamp'],
      clean: ['I am a clean sheet', 'no stains on me'],
      sleep: ['ooo... zzz... ooo'],
      wake: ['boo. good morning.', 'I dreamt of doors'],
      heal: ['less see-through now', 'thank youuu'],
      sad: ['ooo...', 'I feel faint...'],
      evolve: ['I am spookier!', 'ooOOoo!'],
    },
  },
]

export function getCharacter(id: string): CharacterDef {
  const c = CHARACTERS.find((x) => x.id === id)
  if (!c) throw new Error(`Unknown character: ${id}`)
  return c
}

export function randomLine(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]
}
