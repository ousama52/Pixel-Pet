import { useState } from 'react'
import { useGameStore } from '../state/useGameStore'
import { playClip } from '../sound/sounds'

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const settings = useGameStore((s) => s.settings)
  const setMuted = useGameStore((s) => s.setMuted)
  const setVoice = useGameStore((s) => s.setVoice)
  const resetSave = useGameStore((s) => s.resetSave)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="modal__panel">
        <h2 className="heading heading--sm">Settings</h2>

        <label className="toggle">
          <input
            type="checkbox"
            checked={!settings.muted}
            onChange={(e) => {
              setMuted(!e.target.checked)
              if (e.target.checked) playClip('click')
            }}
          />
          <span className="toggle__box" aria-hidden />
          <span>Sound effects</span>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.voice}
            disabled={settings.muted}
            onChange={(e) => setVoice(e.target.checked)}
          />
          <span className="toggle__box" aria-hidden />
          <span>Pet voice</span>
        </label>

        <div className="modal__actions">
          {confirmReset ? (
            <>
              <p className="modal__warn">Really let your pet go? This erases the save.</p>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  playClip('back')
                  resetSave()
                }}
              >
                Yes, reset
              </button>
              <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => setConfirmReset(true)}
            >
              Reset save
            </button>
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              playClip('back')
              onClose()
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
