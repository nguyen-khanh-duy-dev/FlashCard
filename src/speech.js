// Phát âm bằng giọng đọc có sẵn của trình duyệt
let voices = []
function loadVoices() {
  voices = window.speechSynthesis?.getVoices() ?? []
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

export function speak(text, lang = 'en-US') {
  if (!window.speechSynthesis || !text) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = 0.9
  const voice = voices.find((v) => v.lang === lang) || voices.find((v) => v.lang.startsWith(lang.slice(0, 2)))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}
