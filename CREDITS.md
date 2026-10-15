# Credits & Asset Licenses

Every downloaded asset shipped in **Pixel Pet** is listed here with its source URL and
license. No sprite in this project is hand-drawn as a CSS/canvas block grid — all creature
art is sliced out of the downloaded sprite sheets listed below.

---

## Character sprites & UI icons

### DawnLike — 16x16 Universal Rogue-like tileset v1.81

- **Source:** https://opengameart.org/content/dawnlike-16x16-universal-rogue-like-tileset-v181
- **Direct file:** https://opengameart.org/sites/default/files/DawnLike_5.zip
- **Author:** DragonDePlatino
- **Palette:** DawnBringer (DB16) — **attribution to DawnBringer is required by the author**
- **License:** [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)

> "If you use this tileset you must accredit DawnBringer. That mad color-bending genius came
> up with the palette this entire pack lives on." — DragonDePlatino

**Attribution:** Character and item art by **DragonDePlatino** (DawnLike tileset), using the
**DawnBringer** 16-colour palette. Licensed CC-BY 4.0.

Every creature in DawnLike ships as two files (`Sheet0.png` / `Sheet1.png`) which are the two
frames of its idle animation. `scripts/export_sprites.py` slices the tiles below out of those
two files and packs them into one sheet per character — 2 animation frames across, 4 evolution
stages down.

| Pet | DawnLike sheet | baby | child | teen | adult |
| --- | --- | --- | --- | --- | --- |
| Pip (chick) | `Characters/Avian{0,1}.png` | col 0 row 0 | col 1 row 0 | col 0 row 9 | col 1 row 9 |
| Gribbit (newt) | `Characters/Reptile{0,1}.png` | col 0 row 8 | col 1 row 8 | col 2 row 8 | col 1 row 9 |
| Momo (cat) | `Characters/Cat{0,1}.png` | col 0 row 1 | col 1 row 1 | col 2 row 1 | col 1 row 0 |
| Ember (dragon) | `Characters/Reptile{0,1}.png` | col 2 row 0 | col 0 row 1 | col 1 row 1 | col 1 row 3 |
| Waddles (penguin) | `Characters/Avian{0,1}.png` | col 0 row 3 | col 2 row 3 | col 1 row 3 | col 3 row 3 |
| Boo (ghost) | `Characters/Undead{0,1}.png` | col 0 row 4 | col 1 row 4 | col 2 row 4 | col 1 row 6 |

Icons and props sliced from the same pack (`src/assets/icons/`):

| Icon | DawnLike source | Used for |
| --- | --- | --- |
| `apple`, `orange`, `melon`, `banana`, `berry`, `sushi`, `donut`, `cake` | `Items/Food.png` | Feed action + flying food particles |
| `lute` | `Items/Music.png` | Play action |
| `brush` | `Items/Tool.png` | Clean action |
| `bed` | `Objects/Decor0.png` | Sleep action |
| `potion` | `Items/Potion.png` | Heal action |

---

## Sound effects

### Kenney — Digital Audio

- **Source:** https://kenney.nl/assets/digital-audio
- **Author:** Kenney (www.kenney.nl)
- **License:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) — public domain, no attribution required (credited here anyway)

| Shipped as | Original file |
| --- | --- |
| `feed.ogg` | `pepSound1.ogg` |
| `play.ogg` | `powerUp7.ogg` |
| `clean.ogg` | `phaserUp1.ogg` |
| `sleep.ogg` | `lowDown.ogg` |
| `heal.ogg` | `powerUp3.ogg` |
| `evolve.ogg` | `zapThreeToneUp.ogg` |
| `wake.ogg` | `threeTone1.ogg` |

### Kenney — Interface Sounds

- **Source:** https://kenney.nl/assets/interface-sounds
- **Author:** Kenney (www.kenney.nl)
- **License:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)

| Shipped as | Original file |
| --- | --- |
| `click.ogg` | `click_002.ogg` |
| `back.ogg` | `back_001.ogg` |
| `confirm.ogg` | `confirmation_001.ogg` |
| `sick.ogg` | `error_004.ogg` |
| `hatch.ogg` | `maximize_006.ogg` |

Extra blips not covered by the downloaded packs (the happy/refuse/level chirps) are
synthesised at runtime with **Tone.js**, and the pet's squeaky voice uses the browser's
built-in **Web Speech API** — neither ships any recorded audio.

---

## Fonts

| Font | Source | License |
| --- | --- | --- |
| **Press Start 2P** (headings) | [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P) via `@fontsource/press-start-2p` | [SIL Open Font License 1.1](https://openfontlicense.org/) |
| **Silkscreen** (body) | [Google Fonts](https://fonts.google.com/specimen/Silkscreen) via `@fontsource/silkscreen` | [SIL Open Font License 1.1](https://openfontlicense.org/) |

---

## Libraries

| Package | License |
| --- | --- |
| [React](https://react.dev) | MIT |
| [Vite](https://vite.dev) | MIT |
| [Zustand](https://github.com/pmndrs/zustand) | MIT |
| [Tone.js](https://tonejs.github.io) | MIT |
