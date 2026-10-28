import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createDeck, listDecks } from '../api'
import { cardStatus } from '../srs'
import Loading from '../components/Loading'

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

  const now = new Date()
  const stats = {}
  let totalDue = 0
  for (const c of data.cards) {
    const s = (stats[c.deck_id] ??= { total: 0, new: 0, due: 0, mastered: 0 })
    const st = cardStatus(c, now)
    s.total++
    if (st === 'new') s.new++
    if (st === 'due') s.due++
    if (st === 'mastered') s.mastered++
    if (st === 'new' || st === 'due') totalDue++
  }

  return (
    <>
      <section className="panel hero">
        <div>
          <h2>Hôm nay</h2>
          <p className="muted">
            {totalDue > 0 ? `Bạn có ${totalDue} thẻ cần học/ôn.` : 'Không có thẻ nào cần ôn. Tuyệt vời! 🎉'}
          </p>
        </div>
        {totalDue > 0 && <Link to="/review" className="btn primary">Bắt đầu ôn tập</Link>}
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
