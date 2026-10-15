import { SpriteAnimator } from '../characters/SpriteAnimator'
import { CHARACTERS, getCharacter } from '../characters/characterData'
import { useGameStore } from '../state/useGameStore'
import { playClip } from '../sound/sounds'

export function TitleScreen() {
  const pet = useGameStore((s) => s.pet)
  const goSelect = useGameStore((s) => s.goSelect)
  const continueGame = useGameStore((s) => s.continueGame)

  return (
    <div className="screen title">
      <div className="title__parade" aria-hidden>
        {CHARACTERS.map((c, i) => (
          <SpriteAnimator
            key={c.id}
            sheet={c.sheet}
            stage={1}
            size={56}
            fps={2.5}
            className="title__parade-pet"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>

      <h1 className="title__logo">
        <span className="title__logo-line">PIXEL</span>
        <span className="title__logo-line title__logo-line--alt">PET</span>
      </h1>
      <p className="title__tagline">a tiny creature to look after</p>

      <div className="title__menu">
        {pet && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              playClip('confirm')
              continueGame()
            }}
          >
            Continue
            <span className="btn__sub">
              {pet.name} the {getCharacter(pet.characterId).species}
            </span>
          </button>
        )}
        <button
          type="button"
          className={pet ? 'btn' : 'btn btn--primary'}
          onClick={() => {
            playClip('click')
            goSelect()
          }}
        >
          New Game
          {pet && <span className="btn__sub">this replaces {pet.name}</span>}
        </button>
      </div>
    </div>
  )
}
