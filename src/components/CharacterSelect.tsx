import { useState } from 'react'
import { SpriteAnimator } from '../characters/SpriteAnimator'
import { CHARACTERS, SHEET, STAGE_NAMES, type CharacterDef } from '../characters/characterData'
import { useGameStore } from '../state/useGameStore'
import { playClip, playSynth } from '../sound/sounds'

const MAX_NAME = 12

export function CharacterSelect() {
  const [picked, setPicked] = useState<CharacterDef | null>(null)
  const [name, setName] = useState('')
  const adopt = useGameStore((s) => s.adopt)
  const goTitle = useGameStore((s) => s.goTitle)

  if (picked) {
    return (
      <div className="screen confirm" style={{ '--accent': picked.color } as React.CSSProperties}>
        <h2 className="heading">Name your pet</h2>

        <div className="confirm__hero">
          <SpriteAnimator sheet={picked.sheet} stage={0} size={128} fps={2.5} />
        </div>

        <p className="confirm__species">{picked.species}</p>
        <p className="confirm__blurb">{picked.blurb}</p>

        <div className="evoline">
          <span className="evoline__title">grows into</span>
          <div className="evoline__row">
            {Array.from({ length: SHEET.stages }, (_, stage) => (
              <div key={stage} className="evoline__step">
                <SpriteAnimator
                  sheet={picked.sheet}
                  stage={stage}
                  size={44}
                  fps={2}
                  className={stage === 0 ? '' : 'evoline__locked'}
                />
                <span className="evoline__label">{STAGE_NAMES[stage]}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          className="confirm__form"
          onSubmit={(e) => {
            e.preventDefault()
            playClip('hatch')
            adopt(picked.id, name)
          }}
        >
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
            placeholder={picked.name}
            aria-label="Pet name"
            maxLength={MAX_NAME}
            autoFocus
          />
          <div className="confirm__actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                playClip('back')
                setPicked(null)
              }}
            >
              Back
            </button>
            <button type="submit" className="btn btn--primary">
              Adopt!
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="screen select">
      <h2 className="heading">Choose a friend</h2>

      <div className="grid">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            className="card"
            style={{ '--accent': c.color } as React.CSSProperties}
            onClick={() => {
              playClip('click')
              playSynth('select')
              setPicked(c)
              setName('')
            }}
          >
            <div className="card__art">
              <SpriteAnimator sheet={c.sheet} stage={0} size={64} fps={2.5} />
            </div>
            <span className="card__name">{c.name}</span>
            <span className="card__species">{c.species}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => {
          playClip('back')
          goTitle()
        }}
      >
        Back
      </button>
    </div>
  )
}
