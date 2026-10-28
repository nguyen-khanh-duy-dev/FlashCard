export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

// So sánh đáp án: bỏ hoa/thường, khoảng trắng thừa, dấu câu cuối
export function normalize(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]+$/, '')
}

// Đúng nếu khớp toàn bộ, hoặc khớp một trong các nghĩa ngăn cách bởi , ; /
export function isCorrect(input, answer) {
  const a = normalize(input)
  if (!a) return false
  if (a === normalize(answer)) return true
  return answer.split(/[,;/]/).some((part) => normalize(part) === a)
}
