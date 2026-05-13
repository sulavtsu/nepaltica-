'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function StockPage() {
  const { symbol } = useParams()
  const [stock, setStock] = useState(null)
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stocks?symbol=${symbol}`)
      .then(res => res.json())
      .then(data => {
        if (data.stocks && data.stocks.length > 0) {
          setStock(data.stocks[0])
          const priceData = data.stocks[0].prices || []
          setPrices(priceData.reverse())
        }
        setLoading(false)
      })
  }, [symbol])

  if (loading) return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      Loading...
    </div>
  )

  if (!stock) return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      Stock not found
    </div>
  )

  const price = stock.prices?.[stock.prices.length - 1]
  const change = price ? (((price.close - price.open) / price.open) * 100).toFixed(2) : 0
  const isUp = Number(change) >= 0

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>
      
      {/* NAVBAR */}
      <nav style={{ background: "#0d1526", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e2d4a" }}>
        <a href="/" style={{ fontSize: "24px", fontWeight: "bold", color: "#00c853", textDecoration: "none" }}>🏔️ Nepaltica</a>
        <div style={{ display: "flex", gap: "24px", fontSize: "14px" }}>
          <a href="/" style={{ color: "#8892a4", cursor: "pointer", textDecoration: "none" }}>← Back to Market</a>
        </div>
      </nav>

      <div style={{ padding: "32px" }}>
        
        {/* STOCK HEADER */}
        <div style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "bold", color: "#00c853" }}>{stock.symbol}</div>
              <div style={{ fontSize: "16px", color: "#8892a4", marginTop: "4px" }}>{stock.name}</div>
              <div style={{ display: "inline-block", background: "#1e2d4a", padding: "4px 12px", borderRadius: "4px", fontSize: "12px", marginTop: "8px" }}>{stock.sector}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold" }}>Rs {price?.close ?? "-"}</div>
              <div style={{ fontSize: "18px", color: isUp ? "#00c853" : "#ff5252", marginTop: "4px" }}>
                {isUp ? "▲" : "▼"} {Math.abs(Number(change))}%
              </div>
            </div>
          </div>

          {/* PRICE STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "24px" }}>
            {[
              { label: "Open", value: `Rs ${price?.open ?? "-"}` },
              { label: "High", value: `Rs ${price?.high ?? "-"}` },
              { label: "Low", value: `Rs ${price?.low ?? "-"}` },
              { label: "Volume", value: price?.volume?.toLocaleString() ?? "-" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#162035", borderRadius: "8px", padding: "12px" }}>
                <div style={{ fontSize: "11px", color: "#8892a4", marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRICE CHART */}
        <div style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "16px", color: "#00c853" }}>📈 Price Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={prices}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c853" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00c853" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#8892a4", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8892a4", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="close" stroke="#00c853" fill="url(#colorPrice)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* VOLUME CHART */}
        <div style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "16px", color: "#00c853" }}>📊 Volume Chart</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={prices}>
              <XAxis dataKey="date" tick={{ fill: "#8892a4", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8892a4", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "8px" }} />
              <Bar dataKey="volume" fill="#1e3a5f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}