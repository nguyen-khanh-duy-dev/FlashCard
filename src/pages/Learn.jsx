import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dueCards, listCards, reviewCard } from '../api'
import { GRADES, intervalLabel } from '../srs'
import { speak } from '../speech'
import { shuffle } from '../utils'
import SpeakButton from '../components/SpeakButton'
import Loading from '../components/Loading'

// Học ngắt quãng: hiện từ → tự nhớ nghĩa → lật → tự chấm mức độ nhớ.
// Thẻ "Quên" được đưa lại vào cuối phiên, các thẻ khác hẹn ngày ôn tiếp theo.
export default function Learn() {
  const { id } = useParams() // undefined = ôn tất cả các bộ
  const [queue, setQueue] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState({ count: 0, again: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    dueCards(id).then(setQueue).catch((e) => setError(e.message))
  }, [id])

  const card = queue?.[0]

  useEffect(() => {
    if (card) speak(card.term)
  }, [card])

  const grade = useCallback(
    async (g) => {
      if (!card || saving) return
      setSaving(true)
      try {
        const updated = await reviewCard(card, g)
        setQueue((q) => {
          const rest = q.slice(1)
          if (g === 0) rest.splice(Math.min(3, rest.length), 0, updated)
          return rest
        })
        setDone((d) => ({ count: d.count + 1, again: d.again + (g === 0 ? 1 : 0) }))
        setRevealed(false)
      } catch (e) {
        setError(e.message)
      } finally {
        setSaving(false)
      }
    },
    [card, saving]
  )

  useEffect(() => {
    function onKey(e) {
      if (!card) return
      if (!revealed && (e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault()
        setRevealed(true)
      } else if (revealed) {
        const g = GRADES.find((x) => x.key === e.key)
        if (g) grade(g.value)
        else if (e.code === 'Space') {
          e.preventDefault()
          grade(2)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, revealed, grade])

  async function studyAhead() {
    try {
      setQueue(shuffle(await listCards(id)))
    } catch (e) {
      setError(e.message)
    }
  }

  const backLink = id ? `/deck/${id}` : '/'

  if (error) return <p className="msg">{error}</p>
  if (!queue) return <Loading />

  if (!card) {
    return (
      <>
        <Link to={backLink} className="back">← Quay lại</Link>
        <div className="panel center done">
          <div className="done-icon">🎉</div>
          {done.count > 0 ? (
            <>
              <h2>Hoàn thành phiên học!</h2>
              <p className="muted">Bạn đã ôn {done.count} lượt, quên {done.again} lần. Hẹn gặp lại ở lần ôn tiếp theo.</p>
            </>
          ) : (
            <>
              <h2>Không có thẻ nào đến hạn</h2>
              <p className="muted">Các thẻ sẽ tự xuất hiện lại khi đến ngày cần ôn.</p>
            </>
          )}
          <div className="row center-row">
            {id && <button className="btn" onClick={studyAhead}>Ôn trước hạn toàn bộ thẻ</button>}
            <Link to={backLink} className="btn primary">Xong</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Link to={backLink} className="back">← Quay lại</Link>
      <p className="muted center">Còn lại {queue.length} thẻ · Đã ôn {done.count}</p>

      <div className="panel study-card">
        {!card.last_reviewed_at && <span className="badge new corner">Mới</span>}
        <div className="big">{card.term}</div>
        <SpeakButton text={card.term} />
        {revealed && (
          <div className="answer">
            <div className="big def-text">{card.definition}</div>
            {card.example && (
              <div className="example">
                “{card.example}” <SpeakButton text={card.example} />
              </div>
            )}
          </div>
        )}
      </div>

      {!revealed ? (
        <button className="btn primary block lg" onClick={() => setRevealed(true)}>Hiện đáp án (Space)</button>
      ) : (
        <div className="grades">
          {GRADES.map((g) => (
            <button key={g.value} className={`grade ${g.cls}`} onClick={() => grade(g.value)} disabled={saving}>
              <b>{g.label}</b>
              <small>{intervalLabel(card, g.value)}</small>
              <kbd>{g.key}</kbd>
            </button>
          ))}
        </div>
      )}
      <p className="muted center hint">Nhìn từ, tự nhớ nghĩa, rồi lật thẻ và chấm mức độ nhớ của bạn.</p>
    </>
  )
}
