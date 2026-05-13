'use client'
import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    color: '#8892a4',
    border: '#1e2d4a',
    features: [
      '✅ View all 338 NEPSE stocks',
      '✅ Basic market overview',
      '✅ Top gainers & losers',
      '✅ 3 AI questions per day',
      '❌ No stock screener',
      '❌ No price alerts',
      '❌ No advanced charts',
      '❌ No portfolio tracker',
    ],
    button: 'Get Started',
    buttonStyle: { background: 'transparent', border: '1px solid #8892a4', color: '#8892a4' }
  },
  {
    name: 'Pro',
    price: 299,
    period: 'month',
    color: '#00c853',
    border: '#00c853',
    badge: '🔥 Most Popular',
    features: [
      '✅ Everything in Free',
      '✅ Unlimited AI Analyst',
      '✅ Stock screener & filters',
      '✅ Price alerts via email',
      '✅ Advanced charts (RSI, MACD)',
      '✅ Download stock data (CSV)',
      '❌ No portfolio tracker',
      '❌ No buy/sell signals',
    ],
    button: 'Get Pro',
    buttonStyle: { background: '#00c853', border: 'none', color: '#000' }
  },
  {
    name: 'Premium',
    price: 799,
    period: 'month',
    color: '#ffd700',
    border: '#ffd700',
    badge: '👑 Best Value',
    features: [
      '✅ Everything in Pro',
      '✅ Portfolio tracker',
      '✅ Buy/Sell signal suggestions',
      '✅ Daily AI market summary',
      '✅ Floorsheet analysis',
      '✅ Early access to features',
      '✅ Priority support',
      '✅ Yearly discount available',
    ],
    button: 'Get Premium',
    buttonStyle: { background: '#ffd700', border: 'none', color: '#000' }
  }
]

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

  const getPrice = (price) => {
    if (price === 0) return 'Free'
    const p = yearly ? Math.round(price * 10) : price
    return `Rs ${p.toLocaleString()}`
  }

  const getPeriod = (price) => {
    if (price === 0) return ''
    return yearly ? '/year' : '/month'
  }

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#0d1526', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d4a' }}>
        <a href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#00c853', textDecoration: 'none' }}>🏔️ Nepaltica</a>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
          <a href="/" style={{ color: '#8892a4', textDecoration: 'none' }}>Market</a>
          <a href="/ai-analyst" style={{ color: '#8892a4', textDecoration: 'none' }}>AI Analyst</a>
          <a href="/pricing" style={{ color: '#00c853', textDecoration: 'none' }}>Pricing</a>
        </div>
        <a href="/login" style={{ background: 'transparent', color: '#00c853', border: '1px solid #00c853', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' }}>
          Login
        </a>
      </nav>

      {/* HEADER */}
      <div style={{ textAlign: 'center', padding: '64px 32px 32px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>
          Simple, Transparent{' '}
          <span style={{ background: 'linear-gradient(90deg, #00c853, #00d9f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Pricing
          </span>
        </h1>
        <p style={{ color: '#8892a4', fontSize: '18px', marginBottom: '40px' }}>
          Nepal's smartest stock platform — affordable for every investor
        </p>

        {/* TOGGLE */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: '#0d1526', border: '1px solid #1e2d4a', borderRadius: '50px', padding: '8px 24px' }}>
          <span style={{ color: !yearly ? '#fff' : '#8892a4', fontWeight: '600' }}>Monthly</span>
          <div onClick={() => setYearly(!yearly)} style={{
            width: '48px', height: '26px', background: yearly ? '#00c853' : '#1e2d4a',
            borderRadius: '50px', cursor: 'pointer', position: 'relative', transition: 'all 0.3s'
          }}>
            <div style={{
              width: '20px', height: '20px', background: '#fff', borderRadius: '50%',
              position: 'absolute', top: '3px', left: yearly ? '25px' : '3px', transition: 'all 0.3s'
            }} />
          </div>
          <span style={{ color: yearly ? '#fff' : '#8892a4', fontWeight: '600' }}>
            Yearly <span style={{ color: '#00c853', fontSize: '12px' }}>Save 17%</span>
          </span>
        </div>
      </div>

      {/* PLANS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', padding: '32px 64px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        {plans.map((plan) => (
          <div key={plan.name} style={{
            background: '#0d1526',
            border: `2px solid ${plan.border}`,
            borderRadius: '20px',
            padding: '36px',
            position: 'relative',
            transform: plan.name === 'Pro' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: plan.name === 'Pro' ? '0 0 40px rgba(0,200,83,0.2)' : 'none'
          }}>
            {plan.badge && (
              <div style={{
                position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                background: plan.color, color: '#000', padding: '4px 16px', borderRadius: '50px',
                fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap'
              }}>{plan.badge}</div>
            )}

            <div style={{ color: plan.color, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{plan.name}</div>
            <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '4px' }}>
              {getPrice(plan.price)}
              <span style={{ fontSize: '16px', color: '#8892a4', fontWeight: '400' }}>{getPeriod(plan.price)}</span>
            </div>
            {yearly && plan.price > 0 && (
              <div style={{ color: '#00c853', fontSize: '13px', marginBottom: '16px' }}>
                Rs {plan.price}/month billed yearly
              </div>
            )}

            <button style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              fontWeight: '700', fontSize: '16px', cursor: 'pointer',
              marginTop: '16px', marginBottom: '28px',
              ...plan.buttonStyle
            }}>
              {plan.button}
            </button>

            <div style={{ borderTop: '1px solid #1e2d4a', paddingTop: '24px' }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ fontSize: '14px', color: f.startsWith('❌') ? '#8892a4' : '#fff', marginBottom: '12px' }}>
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER NOTE */}
      <div style={{ textAlign: 'center', paddingBottom: '48px', color: '#8892a4', fontSize: '14px' }}>
        🔒 Secure payments via Khalti · Cancel anytime · No hidden fees
      </div>
    </div>
  )
}