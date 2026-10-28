// Ôn tập ngắt quãng theo SM-2 (giống Anki, rút gọn)
// grade: 0 = Quên, 1 = Khó, 2 = Được, 3 = Dễ

export const GRADES = [
  { value: 0, label: 'Quên', key: '1', cls: 'again' },
  { value: 1, label: 'Khó', key: '2', cls: 'hard' },
  { value: 2, label: 'Được', key: '3', cls: 'good' },
  { value: 3, label: 'Dễ', key: '4', cls: 'easy' },
]

const MINUTE = 60 * 1000
const DAY = 24 * 60 * MINUTE

export function schedule(card, grade, now = new Date()) {
  let ease = card.ease ?? 2.5
  let interval = card.interval_days ?? 0
  let reps = card.repetitions ?? 0
  let lapses = card.lapses ?? 0
  let dueMs

  if (grade === 0) {
    reps = 0
    interval = 0
    lapses += 1
    ease = Math.max(1.3, ease - 0.2)
    dueMs = now.getTime() + 10 * MINUTE
  } else {
    const good = reps === 0 ? 1 : reps === 1 ? 3 : Math.max(interval + 1, Math.round(interval * ease))
    if (grade === 1) {
      interval = reps === 0 ? 1 : Math.max(interval + 1, Math.round(interval * 1.2))
      ease = Math.max(1.3, ease - 0.15)
    } else if (grade === 2) {
      interval = good
    } else {
      interval = reps === 0 ? 4 : Math.max(good + 1, Math.round(good * 1.3))
      ease += 0.15
    }
    reps += 1
    dueMs = now.getTime() + interval * DAY
  }

  return {
    ease: Math.round(ease * 100) / 100,
    interval_days: interval,
    repetitions: reps,
    lapses,
    due_at: new Date(dueMs).toISOString(),
    last_reviewed_at: now.toISOString(),
  }
}

export function intervalLabel(card, grade) {
  const next = schedule(card, grade)
  if (grade === 0) return '10 phút'
  return formatDays(next.interval_days)
}

export function formatDays(d) {
  if (d < 30) return `${d} ngày`
  if (d < 365) return `${Math.round(d / 30)} tháng`
  return `${(d / 365).toFixed(1)} năm`
}

export function cardStatus(card, now = new Date()) {
  if (!card.last_reviewed_at) return 'new'
  if (new Date(card.due_at) <= now) return 'due'
  if (card.interval_days >= 21) return 'mastered'
  return 'learning'
}

export const STATUS_LABEL = {
  new: 'Mới',
  due: 'Cần ôn',
  learning: 'Đang học',
  mastered: 'Đã thuộc',
}
