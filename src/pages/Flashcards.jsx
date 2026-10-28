import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listCards } from '../api'
import { speak } from '../speech'
import { shuffle } from '../utils'
import SpeakButton from '../components/SpeakButton'
import Loading from '../components/Loading'

export default function Flashcards() {
  const { id } = useParams()
  const [original, setOriginal] = useState(null)
  const [cards, setCards] = useState([])
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [defFirst, setDefFirst] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listCards(id)
      .then((c) => {
        setOriginal(c)
        setCards(c)
      })
      .catch((e) => setError(e.message))
  }, [id])

  const card = cards[i]

  useEffect(() => {
    if (autoSpeak && card && !defFirst && !flipped) speak(card.term)
  }, [i, card, autoSpeak, defFirst, flipped])

  const go = useCallback(
    (delta) => {
      setFlipped(false)
      setI((x) => Math.min(cards.length - 1, Math.max(0, x + delta)))
    },
    [cards.length]
  )

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (error) return <p className="msg">{error}</p>
  if (!original) return <Loading />
  if (cards.length === 0) return <p className="muted">Bộ này chưa có thẻ nào.</p>

  const front = (
    <>
      <div className="big">{card.term}</div>
      <SpeakButton text={card.term} />
    </>
  )
  const back = (
    <>
      <div className="big">{card.definition}</div>
      {card.example && <div className="example">“{card.example}”</div>}
    </>
  )

  return (
    <>
      <Link to={`/deck/${id}`} className="back">← Quay lại bộ từ</Link>
      <div className="toolbar">
        <button className="chip" onClick={() => { setCards(shuffle(original)); setI(0); setFlipped(false) }}>🔀 Trộn</button>
        <button className="chip" onClick={() => { setCards(original); setI(0); setFlipped(false) }}>↺ Thứ tự gốc</button>
        <button className={`chip ${defFirst ? 'active' : ''}`} onClick={() => { setDefFirst(!defFirst); setFlipped(false) }}>
          ⇄ Hiện nghĩa trước
        </button>
        <button className={`chip ${autoSpeak ? 'active' : ''}`} onClick={() => setAutoSpeak(!autoSpeak)}>🔊 Tự đọc</button>
      </div>

      <div className={`flip ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        <div className="flip-inner">
          <div className="face front">{defFirst ? back : front}</div>
          <div className="face back">{defFirst ? front : back}</div>
        </div>
      </div>

      <div className="nav-row">
        <button className="btn" onClick={() => go(-1)} disabled={i === 0}>← Trước</button>
        <span className="muted">{i + 1} / {cards.length}</span>
        <button className="btn" onClick={() => go(1)} disabled={i === cards.length - 1}>Sau →</button>
      </div>
      <div className="progress"><div style={{ width: `${((i + 1) / cards.length) * 100}%` }} /></div>
      <p className="muted center hint">Phím tắt: Space = lật thẻ · ← → = chuyển thẻ</p>
    </>
  )
}
