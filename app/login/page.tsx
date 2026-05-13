'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('✅ Check your email to confirm your account!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/'
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            background: 'linear-gradient(90deg, #00f5a0, #00d9f5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Nepaltica
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px', fontSize: '14px' }}>
            Nepal's Smart Stock Platform
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '28px'
        }}>
          {['Login', 'Sign Up'].map((tab, i) => (
            <button key={tab} onClick={() => setIsSignUp(i === 1)} style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              background: isSignUp === (i === 1) ? 'linear-gradient(90deg, #00f5a0, #00d9f5)' : 'transparent',
              color: isSignUp === (i === 1) ? '#000' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s'
            }}>{tab}</button>
          ))}
        </div>

        {/* Inputs */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            marginBottom: '12px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            marginBottom: '20px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        {/* Button */}
        <button onClick={handleAuth} disabled={loading} style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(90deg, #00f5a0, #00d9f5)',
          border: 'none',
          borderRadius: '12px',
          color: '#000',
          fontWeight: '700',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.3s'
        }}>
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}
        </button>

        {/* Message */}
        {message && (
          <p style={{
            marginTop: '16px',
            textAlign: 'center',
            color: message.includes('✅') ? '#00f5a0' : '#ff6b6b',
            fontSize: '14px'
          }}>{message}</p>
        )}
      </div>
    </div>
  )
}