import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addCards, deleteCard, deleteDeck, getDeck, listCards, updateCard, updateDeck } from '../api'
import { cardStatus, STATUS_LABEL } from '../srs'
import SpeakButton from '../components/SpeakButton'
import Loading from '../components/Loading'

const SEPARATORS = {
  tab: { label: 'Tab', re: /\t/ },
  dash: { label: ' - ', re: /\s+-\s+/ },
  colon: { label: ':', re: /\s*:\s*/ },
  comma: { label: ',', re: /\s*,\s*/ },
}

function parseBulk(text, sepKey) {
  const re = SEPARATORS[sepKey].re
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(re)
      // Phần 1 = từ, phần 2 = nghĩa, phần còn lại = ví dụ
      return { term: parts[0] ?? '', definition: parts[1] ?? '', example: parts.slice(2).join(' ') }
    })
    .filter((c) => c.term && c.definition)
}

export default function Deck() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deck, setDeck] = useState(null)
  const [cards, setCards] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ term: '', definition: '', example: '' })
  const [showBulk, setShowBulk] = useState(false)
  const [bulk, setBulk] = useState('')
  const [sep, setSep] = useState('dash')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const termRef = useRef(null)

  useEffect(() => {
    Promise.all([getDeck(id), listCards(id)])
      .then(([d, c]) => {
        setDeck(d)
        setCards(c)
      })
      .catch((e) => setError(e.message))
  }, [id])

  async function run(fn) {
    try {
      setError('')
      await fn()
    } catch (e) {
      setError(e.message)
    }
  }

  function onAdd(e) {
    e.preventDefault()
    if (!form.term.trim() || !form.definition.trim()) return
    run(async () => {
      const added = await addCards(id, [form])
      setCards((cs) => [...cs, ...added])
      setForm({ term: '', definition: '', example: '' })
      termRef.current?.focus()
    })
  }

  function onBulk() {
    const items = parseBulk(bulk, sep)
    if (items.length === 0) return setError('Không tìm thấy dòng hợp lệ. Mỗi dòng cần có từ và nghĩa.')
    run(async () => {
      const added = await addCards(id, items)
      setCards((cs) => [...cs, ...added])
      setBulk('')
      setShowBulk(false)
    })
  }

  function onSaveEdit(e) {
    e.preventDefault()
    run(async () => {
      const { id: cid, term, definition, example } = editing
      const updated = await updateCard(cid, { term, definition, example: example || null })
      setCards((cs) => cs.map((c) => (c.id === cid ? updated : c)))
      setEditing(null)
    })
  }

  function onDelete(card) {
    if (!confirm(`Xoá thẻ "${card.term}"?`)) return
    run(async () => {
      await deleteCard(card.id)
      setCards((cs) => cs.filter((c) => c.id !== card.id))
    })
  }

  function onRename() {
    const name = prompt('Tên bộ từ', deck.name)
    if (!name?.trim()) return
    const description = prompt('Mô tả (có thể để trống)', deck.description ?? '') ?? deck.description
    run(async () => setDeck(await updateDeck(id, { name: name.trim(), description })))
  }

  function onDeleteDeck() {
    if (!confirm(`Xoá bộ "${deck.name}" và toàn bộ ${cards.length} thẻ?`)) return
    run(async () => {
      await deleteDeck(id)
      navigate('/')
    })
  }

  if (error && !deck) return <p className="msg">{error}</p>
  if (!deck) return <Loading />

  const now = new Date()
  const counts = { new: 0, due: 0, learning: 0, mastered: 0 }
  cards.forEach((c) => counts[cardStatus(c, now)]++)
  const toStudy = counts.new + counts.due
  const q = search.trim().toLowerCase()
  const visible = q
    ? cards.filter((c) => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q))
    : cards
  const preview = showBulk ? parseBulk(bulk, sep) : []

  return (
    <>
      <Link to="/" className="back">← Tất cả bộ từ</Link>
      <section className="panel">
        <div className="deck-head">
          <div>
            <h2>{deck.name}</h2>
            {deck.description && <p className="muted">{deck.description}</p>}
          </div>
          <div className="row">
            <button className="btn small ghost" onClick={onRename}>Sửa</button>
            <button className="btn small ghost danger" onClick={onDeleteDeck}>Xoá bộ</button>
          </div>
        </div>
        <div className="badges">
          <span className="badge">{cards.length} thẻ</span>
          {Object.entries(counts).map(([k, v]) => v > 0 && (
            <span key={k} className={`badge ${k}`}>{v} {STATUS_LABEL[k].toLowerCase()}</span>
          ))}
        </div>
        <div className="modes">
          <Link to={`/deck/${id}/learn`} className={`mode ${cards.length ? '' : 'disabled'}`}>
            <span className="mode-icon">🧠</span>
            <b>Học & ôn tập</b>
            <small>{toStudy > 0 ? `${toStudy} thẻ đến hạn` : 'Ôn ngắt quãng'}</small>
          </Link>
          <Link to={`/deck/${id}/flashcards`} className={`mode ${cards.length ? '' : 'disabled'}`}>
            <span className="mode-icon">🃏</span>
            <b>Thẻ ghi nhớ</b>
            <small>Lật thẻ, nghe phát âm</small>
          </Link>
          <Link to={`/deck/${id}/write`} className={`mode ${cards.length ? '' : 'disabled'}`}>
            <span className="mode-icon">✍️</span>
            <b>Viết</b>
            <small>Gõ đáp án, nghe & viết</small>
          </Link>
        </div>
      </section>

      {error && <p className="msg">{error}</p>}

      <section className="panel">
        <div className="deck-head">
          <h3>Thêm từ</h3>
          <button className="btn small ghost" onClick={() => setShowBulk(!showBulk)}>
            {showBulk ? 'Thêm từng từ' : 'Nhập nhiều từ'}
          </button>
        </div>

        {!showBulk ? (
          <form className="add-form" onSubmit={onAdd}>
            <input ref={termRef} placeholder="Từ (vd: abandon)" value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })} autoFocus />
            <input placeholder="Nghĩa (vd: từ bỏ)" value={form.definition}
              onChange={(e) => setForm({ ...form, definition: e.target.value })} />
            <input placeholder="Ví dụ (không bắt buộc)" value={form.example}
              onChange={(e) => setForm({ ...form, example: e.target.value })} />
            <button className="btn primary">Thêm</button>
          </form>
        ) : (
          <div className="bulk">
            <p className="muted">
              Mỗi dòng một từ: <code>từ{SEPARATORS[sep].label}nghĩa{SEPARATORS[sep].label}ví dụ</code> (ví dụ không bắt buộc)
            </p>
            <div className="row">
              <span className="muted">Ký tự ngăn cách:</span>
              {Object.entries(SEPARATORS).map(([k, s]) => (
                <button key={k} type="button" className={`chip ${sep === k ? 'active' : ''}`} onClick={() => setSep(k)}>
                  {s.label.trim() || s.label}
                </button>
              ))}
            </div>
            <textarea rows={8} value={bulk} onChange={(e) => setBulk(e.target.value)}
              placeholder={'abandon - từ bỏ - They abandoned the car.\nachieve - đạt được\nbenefit - lợi ích'} />
            <div className="row">
              <button className="btn primary" onClick={onBulk} disabled={preview.length === 0}>
                Thêm {preview.length} từ
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="deck-head">
          <h3>Danh sách từ ({cards.length})</h3>
          <input className="search" placeholder="Tìm…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {visible.length === 0 && <p className="muted">Chưa có từ nào.</p>}
        <ul className="card-list">
          {visible.map((c) =>
            editing?.id === c.id ? (
              <li key={c.id}>
                <form className="add-form" onSubmit={onSaveEdit}>
                  <input value={editing.term} onChange={(e) => setEditing({ ...editing, term: e.target.value })} required />
                  <input value={editing.definition} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} required />
                  <input value={editing.example ?? ''} placeholder="Ví dụ"
                    onChange={(e) => setEditing({ ...editing, example: e.target.value })} />
                  <div className="row">
                    <button className="btn small primary">Lưu</button>
                    <button type="button" className="btn small ghost" onClick={() => setEditing(null)}>Huỷ</button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={c.id}>
                <div className="term">
                  <SpeakButton text={c.term} />
                  <b>{c.term}</b>
                </div>
                <div className="def">
                  {c.definition}
                  {c.example && <div className="example">“{c.example}”</div>}
                </div>
                <span className={`badge ${cardStatus(c, now)}`}>{STATUS_LABEL[cardStatus(c, now)]}</span>
                <div className="actions">
                  <button className="icon-btn" title="Sửa" onClick={() => setEditing(c)}>✏️</button>
                  <button className="icon-btn" title="Xoá" onClick={() => onDelete(c)}>🗑️</button>
                </div>
              </li>
            )
          )}
        </ul>
      </section>
    </>
  )
}
