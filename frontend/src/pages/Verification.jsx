import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function AccountVerification() {
  const [ufid, setUfid] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('Enter Username and Password')
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
    const res = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ufid, password })
    })

    const data = await res.json()
    if (res.ok) {
      setMessage(data.message)
      setTimeout(() => navigate('/listings'), 1500)
    } else {
      setMessage(data.error || 'Something went wrong')
    }
  }

  return (
    <div className="verification-page">
      <h1>WarrantyWarden {isRegister ? 'Sign Up' : 'Login'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={ufid}
          onChange={(e) => setUfid(e.target.value)}
          placeholder="Username (8 digits)"
          maxLength="8"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isRegister ? 'Create Account' : 'Verify'}</button>
      </form>
      <p className="message">{message}</p>
      <button onClick={() => setIsRegister(!isRegister)} style={{ marginTop: '1rem' }}>
        {isRegister ? 'Already have an account? Log in' : 'New to the vault? Create account'}
      </button>
    </div>
  )
}

export default AccountVerification
