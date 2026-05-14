'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

export default function Home() {
  const [stocks, setStocks] = useState([])
const [loading, setLoading] = useState(true)
const [market, setMarket] = useState({ turnover: '...', shares: '...', transactions: '...' })

useEffect(() => {
  fetch('/api/market')
    .then(res => res.json())
    .then(data => setMarket(data))
}, [])

  useEffect(() => {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(data => {
        setStocks(data.stocks || [])
        setLoading(false)
      })
  }, [])

  const getChange = (stock: any) =>  {
    if (!stock.prices || stock.prices.length === 0) return 0
    const price = stock.prices[0]
    return (((price.close - price.open) / price.open) * 100).toFixed(2)
  }

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>
      
      {/* NAVBAR */}
      <nav style={{ background: "#0d1526", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e2d4a" }}>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00c853" }}>🏔️ Nepaltica</div>
        <div style={{ display: "flex", gap: "24px", fontSize: "14px" }}>
          <a href="/" style={{ color: "#00c853", cursor: "pointer", textDecoration: "none" }}>Market</a>
          <a href="/ai-analyst" style={{ color: "#8892a4", cursor: "pointer", textDecoration: "none" }}>AI Analyst</a>
          <a href="/pricing" style={{ color: "#8892a4", cursor: "pointer", textDecoration: "none" }}>Pricing</a>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <a href="/login" style={{ background: "transparent", color: "#00c853", border: "1px solid #00c853", padding: "8px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", textDecoration: "none", fontSize: "14px" }}>
            Login
          </a>
          <a href="/pricing" style={{ background: "#00c853", color: "black", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", textDecoration: "none", fontSize: "14px" }}>
  Get Pro
</a>
        </div>
      </nav>

      {/* MARKET STATS */}
      <div style={{ padding: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "NEPSE Index", value: "2,243.15", change: "+12.3 (0.55%)", up: true },
{ label: "Total Turnover", value: `Rs ${market.turnover}`, change: "Live today", up: true },
{ label: "Traded Shares", value: market.shares, change: `${market.transactions} trades`, up: null },
{ label: "Market Cap", value: "Rs 4.12T", change: "+0.8% today", up: true },
          ].map((item, i) => (
            <div key={i} style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "12px", color: "#8892a4", marginBottom: "8px" }}>{item.label}</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>{item.value}</div>
              <div style={{ fontSize: "12px", color: item.up === null ? "#8892a4" : item.up ? "#00c853" : "#ff5252" }}>{item.change}</div>
            </div>
          ))}
        </div>

        {/* STOCKS TABLE */}
        <div style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "16px", color: "#00c853" }}>📊 Live Stocks</h2>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#8892a4" }}>Loading stocks...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e2d4a" }}>
                  {["Symbol", "Company", "Sector", "LTP", "Open", "High", "Low", "Volume", "Change%"].map(h => (
                    <th key={h} style={{ padding: "10px", textAlign: "left", fontSize: "12px", color: "#8892a4" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => {
                  const price = stock.prices?.[0]
                  const change = getChange(stock)
                  const isUp = change >= 0
                  return (
                    <tr key={stock.symbol} style={{ borderBottom: "1px solid #1e2d4a", cursor: "pointer" }}
                      onClick={() => window.location.href = `/stock/${stock.symbol}`}
                      onMouseEnter={e => e.currentTarget.style.background = "#162035"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold", color: "#00c853" }}>{stock.symbol}</td>
                      <td style={{ padding: "12px 10px", fontSize: "13px" }}>{stock.name}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ background: "#1e2d4a", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>{stock.sector}</span>
                      </td>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Rs {price?.close ?? "-"}</td>
                      <td style={{ padding: "12px 10px", color: "#8892a4" }}>Rs {price?.open ?? "-"}</td>
                      <td style={{ padding: "12px 10px", color: "#00c853" }}>Rs {price?.high ?? "-"}</td>
                      <td style={{ padding: "12px 10px", color: "#ff5252" }}>Rs {price?.low ?? "-"}</td>
                      <td style={{ padding: "12px 10px", color: "#8892a4" }}>{price?.volume?.toLocaleString() ?? "-"}</td>
                      <td style={{ padding: "12px 10px", fontWeight: "bold", color: isUp ? "#00c853" : "#ff5252" }}>
                        {isUp ? "▲" : "▼"} {Math.abs(change)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* GAINERS AND LOSERS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "16px", color: "#00c853" }}>🚀 Top Gainers</h2>
            {[...stocks].sort((a, b) => getChange(b) - getChange(a)).slice(0, 5).map(stock => (
              <div key={stock.symbol} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e2d4a", fontSize: "14px" }}>
                <span style={{ fontWeight: "bold", color: "#00c853" }}>{stock.symbol}</span>
                <span>Rs {stock.prices?.[0]?.close ?? "-"}</span>
                <span style={{ color: "#00c853" }}>+{Math.abs(getChange(stock))}%</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "16px", color: "#ff5252" }}>📉 Top Losers</h2>
            {[...stocks].sort((a, b) => getChange(a) - getChange(b)).slice(0, 5).map(stock => (
              <div key={stock.symbol} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e2d4a", fontSize: "14px" }}>
                <span style={{ fontWeight: "bold", color: "#ff5252" }}>{stock.symbol}</span>
                <span>Rs {stock.prices?.[0]?.close ?? "-"}</span>
                <span style={{ color: "#ff5252" }}>-{Math.abs(getChange(stock))}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}