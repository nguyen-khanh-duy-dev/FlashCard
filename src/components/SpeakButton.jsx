import { speak } from '../speech'

export default function SpeakButton({ text, className = '' }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      title="Phát âm"
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
    >
      🔊
    </button>
  )
}
