import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './pages/Login'
import Home from './pages/Home'
import Deck from './pages/Deck'
import Flashcards from './pages/Flashcards'
import Learn from './pages/Learn'
import Write from './pages/Write'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <div className="container">
        <div className="panel">
          <h2>Chưa cấu hình Supabase</h2>
          <p>
            Tạo file <code>.env</code> ở thư mục gốc (xem <code>.env.example</code>) với{' '}
            <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code>, rồi chạy lại <code>npm run dev</code>.
          </p>
        </div>
      </div>
    )
  }

  if (session === undefined) return <div className="container muted">Đang tải…</div>
  if (!session) return <Login />

  return (
    <>
      <header className="topbar">
        <Link to="/" className="logo">📚 FlashCard</Link>
        <nav>
          <Link to="/review" className="btn small primary">Ôn tập hôm nay</Link>
          <button className="btn small ghost" onClick={() => supabase.auth.signOut()}>Đăng xuất</button>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review" element={<Learn />} />
          <Route path="/deck/:id" element={<Deck />} />
          <Route path="/deck/:id/flashcards" element={<Flashcards />} />
          <Route path="/deck/:id/learn" element={<Learn />} />
          <Route path="/deck/:id/write" element={<Write />} />
        </Routes>
      </main>
    </>
  )
}
