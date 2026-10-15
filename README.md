# 🐣 Pixel Pet

A browser Tamagotchi. Pick one of six 8-bit critters, name it, and keep it fed,
happy, clean and rested while it grows through four evolution stages. Everything
saves to `localStorage`, so your pet is still there next time — including the
time that passed while the tab was closed.

Fully static: **Vite + React + TypeScript + Zustand**, no backend.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build locally
```

## Deploy to Netlify

`netlify.toml` is already set up (build command, publish dir, SPA redirect, asset
caching), so a first deploy is:

```bash
npm install -g netlify-cli   # if you don't have it
npm run build
netlify login
netlify init                 # link/create the site, then it deploys on push
```

Or push a build straight up without linking a repo:

```bash
npm run build
netlify deploy --prod --dir=dist
```

Once the site is linked, repeat deploys are just:

```bash
netlify deploy --prod
```

## How the game works

**Stats** (0–100) decay in real time, calculated from timestamps rather than a
running timer — so closing the tab still costs your pet time. Catch-up is capped
at 8 hours so a long absence is never unrecoverable.

| Stat | Refilled by | Notes |
| --- | --- | --- |
| Hunger | Feed | The fastest-draining need |
| Happiness | Play | Play also costs energy |
| Energy | Sleep | Sleep slows every other drain to 30% |
| Hygiene | Clean | |
| Health | Heal | Derived: drops while other needs sit empty, recovers on its own when they're healthy |

Each character bends those rates — Gribbit the newt barely gets hungry, Momo the
cat gets bored fast, Waddles the penguin recharges on very little sleep, and
Ember the drake grows at roughly half speed in exchange for easygoing needs.

**No death, ever.** An empty need makes the pet droop and show a gentle nudge;
low health shows a "feels poorly" prompt and Heal (45s cooldown) fixes it.

**Evolution** is driven by *care quality*, not just elapsed time: every moment
banks progress in proportion to how far the average of the four needs sits above
40. Roughly 13 minutes of good care reaches Child, then Teen, then Adult.

## Layout

```
scripts/export_sprites.py     slices DawnLike tiles into per-character sheets
src/
  assets/
    characters/<id>/sheet.png 2 animation frames across x 4 evolution stages down
    icons/                    food, potion, bed, brush, lute
    sounds/                   Kenney CC0 clips
  characters/
    characterData.ts          stats, decay multipliers, sheet refs, flavour lines
    SpriteAnimator.tsx        background-position stepping over a sheet
    useFrameIndex.ts          rAF frame stepper
    icons.ts
  components/
    TitleScreen.tsx  CharacterSelect.tsx  GameScreen.tsx
    PetStage.tsx  StatBar.tsx  ActionButton.tsx  SpeechBubble.tsx  SettingsPanel.tsx
  sound/sounds.ts             Kenney clips + Tone.js fallback synths + speech synth
  state/useGameStore.ts       zustand store, decay maths, save/load
```

## Assets

All art and audio is downloaded, licensed, and credited in
[CREDITS.md](CREDITS.md) — nothing is hand-drawn as CSS or canvas blocks.
Character sprites come from **DawnLike** (CC-BY 4.0, DragonDePlatino, DB16
palette by DawnBringer); sound effects from **Kenney** (CC0).

To re-slice the sprite sheets you need the DawnLike zip extracted to
`%TEMP%/ppassets/dawnlike` and Python with Pillow, then:

```bash
python scripts/export_sprites.py
```

## Sound

Three layers, all optional and mutable from Settings:

1. Downloaded Kenney CC0 clips for feed/play/clean/sleep/heal/evolve and UI.
2. **Tone.js** square-wave blips for the few cues the pack doesn't cover
   (happy sparkle, refusal, selection) — lazily imported so it stays out of the
   initial bundle.
3. A squeaky **Web Speech API** voice (`pitch: 1.8`) so the pet says its lines.

Audio unlocks on the first click or keypress, per browser autoplay rules.
