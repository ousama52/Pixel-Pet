interface SpeechBubbleProps {
  text: string | null
}

export function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <div className={`bubble ${text ? 'bubble--on' : ''}`} aria-live="polite">
      <span className="bubble__text">{text ?? ''}</span>
      <span className="bubble__tail" />
    </div>
  )
}
