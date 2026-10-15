# 🐣 Pixel Pet — Cute 8-bit Tamagotchi Web App Spec

Give this whole document to Claude Code in VS Code as your prompt. It has everything needed to scaffold, build, and deploy the app.

## Concept
A browser-based Tamagotchi-style pet game with:
- A **character select screen** showing several cute 8-bit critters
- Pick one, name it, and raise it (feed, play, clean, sleep, heal)
- **Retro pixel-art UI**, bright colors, chunky pixel font, screen-shake/bounce animations
- **Cute sound effects** for actions (chiptune blips/squeaks — see "Voice & Sound" below)
- Progress saved automatically (localStorage) so the pet persists between visits
- Deploys as a static site to **Netlify via CLI**

## Tech Stack
- **Vite + React + TypeScript** (fast, simple static build, perfect for Netlify)
- **Real downloaded pixel-art sprite sheets** for the characters — not code-drawn blocks (see "Character Art Sourcing" below)
- **Tone.js** or plain **Web Audio API** for tiny 8-bit blip/squeak sound effects, layered with free downloaded chiptune SFX where available (see "Voice & Sound")
- **localStorage** for save state
- **Zustand** (or React Context) for simple state management
- No backend needed — fully static

## Character Art Sourcing (agent should download real assets, not draw blocky grids)
Have Claude Code fetch free, properly licensed pixel-art animal/creature sprite sheets from sources that allow commercial/free use with attribution tracked in a `CREDITS.md` file. Good sources to pull from:
- **Kenney.nl** (kenney.nl/assets) — CC0, no attribution required, huge library of pixel-art animals, UI elements, and even a "Tiny Town"/"Animal Pack" style set. Best default choice since it's zero-friction licensing.
- **OpenGameArt.org** — filter by license (CC0 or CC-BY) and search "pixel animal," "creature," "pet sprite sheet."
- **itch.io free assets** (itch.io/game-assets/free/tag-pixel-art) — many free cute-creature packs (check each one's license, most are CC0 or free-for-any-use).
- **Craftpix.net free section** — has free pixel pet/monster packs (check license terms per pack, some require attribution).

Agent instructions:
1. Search/download 4–6 distinct creature sprite sheets (each ideally with idle/walk/eat/sleep frames, or at least a few expression variants) from the sources above.
2. Save them into `src/assets/characters/<name>/` as PNG spritesheets.
3. Log the source URL and license of each into `CREDITS.md` at the project root.
4. Use `react-spritesheet` style CSS `background-position` stepping or a small custom hook to animate frames from the sheet — no hand-drawn block grids.
5. If a genuinely great fit can't be found for a character concept, it's fine to swap the character concept to match whatever quality free art is actually available, rather than forcing a mismatched sprite.

## Characters (at least 6 to choose from, art-driven by whatever is found)
Suggested personality slots to fill with sourced sprites — pick actual creatures based on what's available in the packs above, not necessarily these exact species:
1. 🐥 Cheerful chick/bird type — high energy drain
2. 🐸 Chill frog/amphibian type — low hunger drain
3. 🐱 Affectionate cat/mammal type — needs lots of play
4. 🐲 Rare dragon/fantasy creature — slow to grow, strong stats
5. 🐧 Cold-loving type — loves sleep, low energy drain
6. 👻 Spooky-cute type — low hygiene needs, quirky idle animation

Each character should have:
- Idle animation from its sprite sheet (frame-swap loop)
- 3–4 evolution stages based on care quality over time (baby → child → teen → adult) — either via different frames/sheets per stage if the pack has them, or via simple scale/palette-shift if not
- Unique personality flavor-text lines

## Core Game Mechanics
Stats (0–100 scale, decay over time via `setInterval` or timestamp-based calc on load):
- **Hunger** — Feed action refills it
- **Happiness** — Play action refills it
- **Energy** — Sleep action refills it (also pauses decay while sleeping)
- **Hygiene** — Clean action refills it
- **Health** — derived from the other stats; if others stay low too long, health drops; very low health = "sick" state requiring a Heal action (with a short cooldown, like giving medicine)

Neglect state: if a stat hits 0, character shows a sad/distressed animation and a gentle nudge message — **no permanent death**, keep it low-stakes and cute rather than punishing (this keeps the game welcoming rather than stressful).

Aging: pet evolves after N hours of "good care" (average stats above threshold), tracked via total playtime + average stat history.

## Voice & Sound
Two options, can combine both:
- **Downloaded free SFX**: Kenney.nl also publishes free CC0 sound packs (e.g. "Interface Sounds," "Digital Audio," "RPG Audio") with cute blips/chimes ready to use — download a handful for feed/play/clean/sleep/evolve events and log them in `CREDITS.md` alongside the sprite credits.
- **Synthesized fallback**: **Tone.js** for any extra blips not covered by the downloaded pack (ascending squeak for feeding, playful boop for playing, descending tone for sleep, sparkle arpeggio for evolution).
- **Cute "voice"**: use the **Web Speech API** (`speechSynthesis`) with pitch turned up (`utterance.pitch = 1.8`, rate slightly fast) so the pet can squeak tiny phrases like "yay!", "yummy!", "zzz…" — no real voice recordings needed.

## UI / Screens
1. **Title screen** — game logo in pixel font, "New Game" / "Continue" (continue only shows if save exists)
2. **Character Select** — grid of character cards, each animated idle, tap/click to preview + confirm, then name your pet
3. **Main Game Screen**
   - Pet sprite centered, big and animated
   - Stat bars (hunger/happy/energy/hygiene) as chunky pixel progress bars
   - Action buttons as big tappable pixel-icon buttons: Feed / Play / Clean / Sleep / Heal
   - Small speech-bubble for pet reactions/voice lines
4. **Settings/Reset** — mute sound toggle, reset save

Visual style: pastel palette, thick black pixel outlines, bouncy button press animations, a font like "Press Start 2P" (Google Fonts) for headers, a friendlier rounded pixel font for body text.

## Suggested File Structure
```
src/
  assets/
    characters/<name>/     // downloaded PNG sprite sheets
    sounds/                 // downloaded SFX
  components/
    CharacterSelect.tsx
    PetStage.tsx
    StatBar.tsx
    ActionButton.tsx
    SpeechBubble.tsx
  characters/
    characterData.ts       // stats, sprite sheet refs, frame maps per character
    SpriteAnimator.tsx      // steps through a sprite sheet's frames via CSS background-position
  sound/
    sounds.ts               // loads downloaded SFX + Tone.js fallback synths + speech synth helper
  state/
    useGameStore.ts         // zustand store: current pet, stats, save/load
  App.tsx
  main.tsx
CREDITS.md                  // source + license for every downloaded asset
```

## Netlify Deployment (CLI)
After the app is built and working locally:
```bash
npm install -g netlify-cli   # if not already installed
npm run build                # produces /dist
netlify login
netlify init                 # or: netlify deploy --prod --dir=dist
```
For repeat deploys once linked:
```bash
netlify deploy --prod
```

## Prompt to give Claude Code
> Build this Tamagotchi web app exactly as specified above: Vite + React + TypeScript, character select with 6 real downloaded pixel-art creature sprite sheets (source from Kenney.nl, OpenGameArt, or itch.io free packs — CC0 or clearly free-use only, logged in CREDITS.md), full care-stat game loop, cute sound effects combining downloaded free SFX with Tone.js/Web Speech fallbacks, pixel-art retro UI with "Press Start 2P" font, localStorage persistence. Do not hand-draw sprites as CSS/canvas block grids — use actual sprite sheet assets. Set it up so I can deploy it to Netlify with the CLI (`netlify deploy --prod --dir=dist`). Start by scaffolding the Vite project, then source and download the character art and sound assets, then build state management, then screens, then polish animations.

