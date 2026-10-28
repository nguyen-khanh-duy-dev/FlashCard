import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listCards } from '../api'
import { speak } from '../speech'
import { isCorrect, shuffle } from '../utils'
import SpeakButton from '../components/SpeakButton'
import Loading from '../components/Loading'

const MODES = {
  def2term: { label: 'Nghĩa → Viết từ' },
  term2def: { label: 'Từ → Viết nghĩa' },
  listen: { label: '🎧 Nghe & viết' },
}

export default function Write() {
  const { id } = useParams()
  const [all, setAll] = useState(null)
  const [mode, setMode] = useState('def2term')
  const [queue, setQueue] = useState([])
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null) // null | 'right' | 'wrong'
  const [score, setScore] = useState({ right: 0, wrong: 0 })
  const [missed, setMissed] = useState([])
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    listCards(id)
      .then((c) => {
        setAll(c)
        setQueue(shuffle(c))
      })
      .catch((e) => setError(e.message))
  }, [id])

  const card = queue[0]
  const answer = card ? (mode === 'term2def' ? card.definition : card.term) : ''

  useEffect(() => {
    if (card && mode === 'listen') speak(card.term)
    inputRef.current?.focus()
  }, [card, mode])

  function restart(newMode = mode, cards = all) {
    setMode(newMode)
    setQueue(shuffle(cards))
    setInput('')
    setResult(null)
    setScore({ right: 0, wrong: 0 })
    setMissed([])
  }

  function check(e) {
    e.preventDefault()
    if (result) return next()
    if (!input.trim()) return
    const ok = isCorrect(input, answer)
    setResult(ok ? 'right' : 'wrong')
    if (mode !== 'listen' || ok) speak(card.term)
    setScore((s) => (ok ? { ...s, right: s.right + 1 } : { ...s, wrong: s.wrong + 1 }))
    if (!ok) setMissed((m) => (m.some((c) => c.id === card.id) ? m : [...m, card]))
  }

  function giveUp() {
    setResult('wrong')
    setScore((s) => ({ ...s, wrong: s.wrong + 1 }))
    setMissed((m) => (m.some((c) => c.id === card.id) ? m : [...m, card]))
    speak(card.term)
  }

  function next(overrideRight = false) {
    setQueue((q) => {
      const rest = q.slice(1)
      // Sai thì gặp lại ở cuối vòng
      return result === 'wrong' && !overrideRight ? [...rest, card] : rest
    })
    setInput('')
    setResult(null)
  }

  function iWasRight() {
    setScore((s) => ({ right: s.right + 1, wrong: s.wrong - 1 }))
    setMissed((m) => m.filter((c) => c.id !== card.id))
    next(true)
  }

  if (error) return <p className="msg">{error}</p>
  if (!all) return <Loading />
  if (all.length === 0) return <p className="muted">Bộ này chưa có thẻ nào.</p>

  const toolbar = (
    <div className="toolbar">
      {Object.entries(MODES).map(([k, m]) => (
        <button key={k} className={`chip ${mode === k ? 'active' : ''}`} onClick={() => restart(k)}>{m.label}</button>
      ))}
    </div>
  )

  if (!card) {
    const total = score.right + score.wrong
    return (
      <>
        <Link to={`/deck/${id}`} className="back">← Quay lại bộ từ</Link>
        {toolbar}
        <div className="panel center done">
          <div className="done-icon">✅</div>
          <h2>Hoàn thành!</h2>
          <p className="muted">
            Đúng {score.right}/{total} lần trả lời ({total ? Math.round((score.right / total) * 100) : 0}%)
          </p>
          {missed.length > 0 && (
            <>
              <h3>Các từ bạn viết sai</h3>
              <ul className="missed">
                {missed.map((c) => (
                  <li key={c.id}><b>{c.term}</b> — {c.definition}</li>
                ))}
              </ul>
            </>
          )}
          <div className="row center-row">
            {missed.length > 0 && <button className="btn" onClick={() => restart(mode, missed)}>Luyện lại từ sai</button>}
            <button className="btn primary" onClick={() => restart()}>Làm lại tất cả</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Link to={`/deck/${id}`} className="back">← Quay lại bộ từ</Link>
      {toolbar}
      <p className="muted center">Còn {queue.length} · ✓ {score.right} · ✗ {score.wrong}</p>

      <div className="panel study-card">
        {mode === 'listen' ? (
          <>
            <button className="btn lg" type="button" onClick={() => speak(card.term)}>🔊 Nghe lại</button>
            <p className="muted">Gợi ý: {card.definition}</p>
          </>
        ) : (
          <>
            <div className="big">{mode === 'def2term' ? card.definition : card.term}</div>
            {mode === 'term2def' && <SpeakButton text={card.term} />}
            {mode === 'def2term' && card.example && result === null && (
              <div className="example">“{card.example.replace(new RegExp(escapeRe(card.term), 'gi'), '____')}”</div>
            )}
          </>
        )}
      </div>

      <form onSubmit={check} className="write-form">
        <input
          ref={inputRef}
          className={`write-input ${result ?? ''}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'term2def' ? 'Nhập nghĩa…' : 'Nhập từ tiếng Anh…'}
          readOnly={!!result}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {result === 'right' && <p className="feedback right">✓ Chính xác!</p>}
        {result === 'wrong' && (
          <div className="feedback wrong">
            ✗ Đáp án đúng: <b>{answer}</b>
            {card.example && <div className="example">“{card.example}”</div>}
          </div>
        )}
        <div className="row">
          {!result && <button type="button" className="btn ghost" onClick={giveUp}>Không biết</button>}
          {result === 'wrong' && <button type="button" className="btn ghost" onClick={iWasRight}>Tôi đã đúng</button>}
          <button className="btn primary grow">{result ? 'Tiếp tục (Enter)' : 'Kiểm tra (Enter)'}</button>
        </div>
      </form>
    </>
  )
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
