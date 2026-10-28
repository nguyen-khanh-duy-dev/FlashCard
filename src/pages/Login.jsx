import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { data, error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) return setMsg(error.message)
    if (mode === 'signup' && !data.session) setMsg('Đã gửi email xác nhận. Hãy kiểm tra hộp thư rồi đăng nhập.')
  }

  return (
    <div className="login-wrap">
      <form className="panel login" onSubmit={submit}>
        <h1>📚 FlashCard</h1>
        <p className="muted">Học từ vựng với thẻ ghi nhớ & ôn tập ngắt quãng</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Mật khẩu
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        {msg && <p className="msg">{msg}</p>}
        <button className="btn primary block" disabled={busy}>
          {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </form>
    </div>
  )
}
