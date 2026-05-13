'use client'
import { useState } from 'react'

export default function AIAnalyst() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const askAI = async () => {
    if (!question.trim()) return
    setLoading(true)
    const q = question
    setQuestion('')

    const stockContext = "NEPSE Index: 2243.15, Top gainers: NABIL +2.47%, NLIC +2.19%, Top losers: HIDCL -1.57%, GBIME -1.2%"

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, stockContext })
    })

    const data = await res.json()
    setHistory(prev => [...prev, { q, a: data.answer }])
    setAnswer(data.answer)
    setLoading(false)
  }

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>
      <nav style={{ background: "#0d1526", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e2d4a" }}>
        <a href="/" style={{ fontSize: "24px", fontWeight: "bold", color: "#00c853", textDecoration: "none" }}>🏔️ Nepaltica</a>
        <a href="/" style={{ color: "#8892a4", textDecoration: "none", fontSize: "14px" }}>← Back to Market</a>
      </nav>

      <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", color: "#00c853" }}>🤖 AI Analyst</h1>
        <p style={{ color: "#8892a4", marginBottom: "32px" }}>Ask anything about NEPSE stocks and market</p>

        {/* QUICK QUESTIONS */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          {[
            "Should I buy NABIL stock?",
            "What sectors are doing well today?",
            "Explain NEPSE trading hours",
            "Best hydro power stocks?",
            "How to start investing in NEPSE?"
          ].map(q => (
            <button key={q} onClick={() => setQuestion(q)}
              style={{ background: "#0d1526", border: "1px solid #1e2d4a", color: "#8892a4", padding: "8px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "13px" }}>
              {q}
            </button>
          ))}
        </div>

        {/* CHAT HISTORY */}
        <div style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "20px", marginBottom: "20px", minHeight: "300px" }}>
          {history.length === 0 && !loading && (
            <div style={{ textAlign: "center", color: "#8892a4", padding: "60px 0" }}>
              Ask me anything about NEPSE! 📈
            </div>
          )}
          {history.map((item, i) => (
            <div key={i} style={{ marginBottom: "20px" }}>
              <div style={{ background: "#162035", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
                <span style={{ color: "#00c853", fontWeight: "bold", fontSize: "12px" }}>YOU: </span>
                <span style={{ fontSize: "14px" }}>{item.q}</span>
              </div>
              <div style={{ background: "#1a2a1a", borderRadius: "8px", padding: "12px" }}>
                <span style={{ color: "#00c853", fontWeight: "bold", fontSize: "12px" }}>AI: </span>
                <span style={{ fontSize: "14px", lineHeight: "1.6" }}>{item.a}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: "center", color: "#00c853", padding: "20px" }}>
              Analyzing market data... ⏳
            </div>
          )}
        </div>

        {/* INPUT */}
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askAI()}
            placeholder="Ask about any NEPSE stock..."
            style={{ flex: 1, background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "8px", padding: "12px 16px", color: "white", fontSize: "14px", outline: "none" }}
          />
          <button onClick={askAI} disabled={loading}
            style={{ background: "#00c853", color: "black", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}>
            {loading ? "..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  )
}