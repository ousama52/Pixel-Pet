import { useEffect } from 'react'
import { CharacterSelect } from './components/CharacterSelect'
import { GameScreen } from './components/GameScreen'
import { TitleScreen } from './components/TitleScreen'
import { useGameStore } from './state/useGameStore'
import { setMuted, setVoiceEnabled, unlockAudio } from './sound/sounds'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const pet = useGameStore((s) => s.pet)
  const settings = useGameStore((s) => s.settings)

  // Keep the audio module in step with the persisted settings.
  useEffect(() => setMuted(settings.muted), [settings.muted])
  useEffect(() => setVoiceEnabled(settings.voice), [settings.voice])

  // Browsers won't let anything make noise until the user has interacted once.
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  return (
    <div className="app">
      <div className="app__frame">
        {screen === 'game' && pet ? (
          <GameScreen key={pet.bornAt} />
        ) : screen === 'select' ? (
          <CharacterSelect />
        ) : (
          <TitleScreen />
        )}
      </div>
      <footer className="app__credit">
        art: DawnLike by DragonDePlatino (DB16 palette by DawnBringer, CC-BY 4.0) · sound:
        Kenney (CC0)
      </footer>
    </div>
  )
}
