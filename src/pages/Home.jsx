import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createDeck, listDecks } from '../api'
import { cardStatus, endOfToday, todayWords } from '../srs'
import Loading from '../components/Loading'

const DAY = 24 * 60 * 60 * 1000
const UPCOMING_DAYS = 7

function dayLabel(days) {
  if (days === 1) return 'Ngày mai'
  const d = new Date(Date.now() + days * DAY)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function TodayGroup({ title, decks, count }) {
  return (
    <div className="today-group">
      <h4>{title}</h4>
      {decks.map((d) => (
        <Link to={`/deck/${d.id}/learn`} key={d.id} className="today-item">
          <span>{d.name}</span>
          <span className="muted">{count(d)} →</span>
        </Link>
      ))}
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    listDecks().then(setData).catch((e) => setError(e.message))
  }, [])

  async function onCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const deck = await createDeck(name.trim())
      navigate(`/deck/${deck.id}`)
    } catch (e) {
      setError(e.message)
    }
  }

  if (error) return <p className="msg">{error}</p>
  if (!data) return <Loading />

  const cutoff = endOfToday()
  const stats = {}
  const upcoming = {} // số ngày kể từ hôm nay → số thẻ đến hạn
  let totalDue = 0
  for (const c of data.cards) {
    const s = (stats[c.deck_id] ??= { total: 0, new: 0, due: 0, mastered: 0 })
    const st = cardStatus(c, cutoff)
    s.total++
    if (st === 'new') s.new++
    if (st === 'due') s.due++
    if (st === 'mastered') s.mastered++
    if (st === 'new' || st === 'due') totalDue++
    if (st === 'learning' || st === 'mastered') {
      const days = Math.ceil((new Date(c.due_at) - cutoff) / DAY)
      if (days <= UPCOMING_DAYS) upcoming[days] = (upcoming[days] ?? 0) + 1
    }
  }

  // Ôn lại: bộ có thẻ đến hạn. Học mới: bộ đã bắt đầu học nhưng còn thẻ mới.
  const toReview = data.decks.filter((d) => stats[d.id]?.due > 0)
  const toLearn = data.decks.filter((d) => {
    const s = stats[d.id]
    return s && s.new > 0 && s.new < s.total
  })

  const today = todayWords(data.decks, data.cards)
  const deckName = Object.fromEntries(data.decks.map((d) => [d.id, d.name]))

  return (
    <>
      {today.words.length > 0 && (
        <section className="panel">
          <div className="hero">
            <div>
              <h2>🎯 Từ mới hôm nay</h2>
              <p className="muted">
                {today.mastered >= today.goal
                  ? `Đã đạt mục tiêu: nắm được ${today.mastered} từ hôm nay! 🎉`
                  : `Đã nắm ${today.mastered}/${today.goal} từ — mục tiêu mỗi ngày ${today.goal} từ.`}
              </p>
            </div>
            {today.words.some((c) => !(c.interval_days >= 1)) && (
              <Link to="/today" className="btn primary">Học từ hôm nay</Link>
            )}
          </div>
          <div className="progress">
            <div style={{ width: `${Math.min(100, (today.mastered / today.goal) * 100)}%` }} />
          </div>
          <ul className="today-words">
            {today.words.map((c) => {
              const ok = c.interval_days >= 1
              return (
                <li key={c.id} className={ok ? 'ok' : ''}>
                  <span className="mark">{ok ? '✓' : c.learned_at ? '↺' : '○'}</span>
                  <b>{c.term}</b>
                  <span className="muted">{c.definition}</span>
                  <span className="badge">{deckName[c.deck_id]}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="panel">
        <div className="hero">
          <div>
            <h2>Hôm nay</h2>
            <p className="muted">
              {totalDue > 0 ? `Bạn có ${totalDue} thẻ cần học/ôn.` : 'Không có thẻ nào cần ôn. Tuyệt vời! 🎉'}
            </p>
          </div>
          {totalDue > 0 && <Link to="/review" className="btn primary">Bắt đầu ôn tập</Link>}
        </div>

        {(toReview.length > 0 || toLearn.length > 0) && (
          <div className="today-plan">
            {toReview.length > 0 && (
              <TodayGroup title="🔁 Ôn lại" decks={toReview} count={(d) => `${stats[d.id].due} thẻ đến hạn`} />
            )}
            {toLearn.length > 0 && (
              <TodayGroup title="✨ Học tiếp" decks={toLearn} count={(d) => `còn ${stats[d.id].new} từ mới`} />
            )}
          </div>
        )}

        {Object.keys(upcoming).length > 0 && (
          <div className="badges upcoming">
            <span className="muted">Sắp tới:</span>
            {Object.entries(upcoming)
              .sort(([a], [b]) => a - b)
              .map(([days, n]) => (
                <span key={days} className="badge learning">{dayLabel(Number(days))}: {n} thẻ</span>
              ))}
          </div>
        )}
      </section>

      <form className="row create" onSubmit={onCreate}>
        <input placeholder="Tên bộ từ mới, ví dụ: IELTS Unit 1" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn primary">+ Tạo bộ</button>
      </form>

      {data.decks.length === 0 ? (
        <p className="muted center">Chưa có bộ từ nào. Hãy tạo bộ đầu tiên ở trên.</p>
      ) : (
        <div className="grid">
          {data.decks.map((d) => {
            const s = stats[d.id] ?? { total: 0, new: 0, due: 0, mastered: 0 }
            return (
              <Link to={`/deck/${d.id}`} key={d.id} className="deck-card">
                <h3>{d.name}</h3>
                {d.description && <p className="muted">{d.description}</p>}
                <div className="badges">
                  <span className="badge">{s.total} thẻ</span>
                  {s.new > 0 && <span className="badge new">{s.new} mới</span>}
                  {s.due > 0 && <span className="badge due">{s.due} cần ôn</span>}
                  {s.mastered > 0 && <span className="badge mastered">{s.mastered} đã thuộc</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
