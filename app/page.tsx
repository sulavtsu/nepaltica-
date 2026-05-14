'use client'
import { useEffect, useState } from 'react'

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .fade-up   { animation: fadeUp 0.5s ease both; }
  .stat-card {
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    cursor: default;
  }
  .stat-card:hover {
    transform: translateY(-4px);
    border-color: #00c853 !important;
    box-shadow: 0 0 20px rgba(0,200,83,0.15);
  }
  .stock-row { transition: background 0.15s ease; cursor: pointer; }
  .stock-row:hover { background: #162035; }
  .gainer-row, .loser-row { transition: background 0.15s ease; cursor: pointer; }
  .gainer-row:hover { background: rgba(0,200,83,0.05); }
  .loser-row:hover  { background: rgba(255,82,82,0.05); }
  .nav-link { transition: color 0.2s ease; }
  .nav-link:hover  { color: #ffffff !important; }
  .live-dot { animation: pulse 1.5s ease-in-out infinite; }
  .skeleton {
    background: linear-gradient(90deg, #1e2d4a 25%, #2a3d5e 50%, #1e2d4a 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
  }
`

export default function Home() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [market, setMarket] = useState({ turnover: '...', shares: '...', transactions: '...' })
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/market').then(r => r.json()).then(d => setMarket(d))
  }, [])

  useEffect(() => {
    fetch('/api/stocks').then(r => r.json()).then(d => {
      setStocks(d.stocks || [])
      setLoading(false)
    })
  }, [])

  const getChange = (stock: any) => {
    if (!stock.prices?.length) return 0
    const p = stock.prices[0]
    return parseFloat((((p.close - p.open) / p.open) * 100).toFixed(2))
  }

  const stats = [
    { label: "NEPSE Index", value: market.index ?? "...", change: market.indexChange ?? "Live", up: true },
    { label: "Total Turnover", value: `Rs ${market.turnover}`, change: "Live today", up: true },
    { label: "Traded Shares", value: market.shares, change: `${market.transactions} trades`, up: null },
    { label: "Market Cap", value: market.marketCap ?? "...", change: "Live today", up: true },
  ]
  

  return (
    <>
      <style>{styles}</style>
      <div style={{ background: "#0a0f1e", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>

        {/* NAVBAR */}
        <nav style={{ background: "#0d1526", borderBottom: "1px solid #1e2d4a", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

            {/* Logo */}
            <div style={{ fontSize: "22px", fontWeight: "bold", color: "#00c853", letterSpacing: "-0.5px" }}>
              🏔️ Nepaltica
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex" style={{ gap: "32px", fontSize: "14px" }}>
              <a href="/"            className="nav-link no-underline" style={{ color: "#00c853" }}>Market</a>
              <a href="/ai-analyst"  className="nav-link no-underline" style={{ color: "#8892a4" }}>AI Analyst</a>
              <a href="/pricing"     className="nav-link no-underline" style={{ color: "#8892a4" }}>Pricing</a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex" style={{ gap: "12px" }}>
              <a href="/login" className="no-underline" style={{
                color: "#00c853", border: "1px solid #00c853", padding: "8px 20px",
                borderRadius: "8px", fontSize: "14px", fontWeight: "600",
                transition: "all 0.2s ease", background: "transparent"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,200,83,0.1)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent" }}>
                Login
              </a>
              <a href="/pricing" className="no-underline" style={{
                background: "#00c853", color: "black", padding: "8px 20px",
                borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                transition: "all 0.2s ease"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#00e676" }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#00c853" }}>
                Get Pro ✦
              </a>
            </div>

            {/* Hamburger */}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px", padding: "8px" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: "block", width: "22px", height: "2px", background: "#00c853",
                  borderRadius: "2px", transition: "all 0.3s ease",
                  transform: menuOpen && i === 0 ? "rotate(45deg) translate(5px,5px)" :
                             menuOpen && i === 1 ? "scaleX(0)" :
                             menuOpen && i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "none"
                }} />
              ))}
            </button>
          </div>

          {/* Mobile Menu */}
          <div style={{
            maxHeight: menuOpen ? "300px" : "0", overflow: "hidden",
            transition: "max-height 0.3s ease", borderTop: menuOpen ? "1px solid #1e2d4a" : "none"
          }}>
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
              <a href="/"           className="nav-link no-underline" style={{ color: "#00c853",  fontSize: "15px" }}>Market</a>
              <a href="/ai-analyst" className="nav-link no-underline" style={{ color: "#8892a4", fontSize: "15px" }}>AI Analyst</a>
              <a href="/pricing"    className="nav-link no-underline" style={{ color: "#8892a4", fontSize: "15px" }}>Pricing</a>
              <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                <a href="/login"   className="no-underline" style={{ color: "#00c853", border: "1px solid #00c853", padding: "8px 16px", borderRadius: "8px", fontSize: "13px" }}>Login</a>
                <a href="/pricing" className="no-underline" style={{ background: "#00c853", color: "black", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}>Get Pro ✦</a>
              </div>
            </div>
          </div>
        </nav>

        {/* LIVE BADGE */}
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="live-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00c853", display: "inline-block" }} />
          <span style={{ fontSize: "12px", color: "#8892a4", letterSpacing: "0.05em" }}>LIVE MARKET DATA</span>
        </div>

        <div style={{ padding: "16px 24px 32px" }}>

          {/* STAT CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "24px" }}
               className="md:grid-cols-4">
            {stats.map((item, i) => (
              <div key={i} className="stat-card fade-up" style={{
                background: "#0d1526", border: "1px solid #1e2d4a",
                borderRadius: "14px", padding: "18px 20px",
                animationDelay: `${i * 0.08}s`
              }}>
                <div style={{ fontSize: "11px", color: "#8892a4", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                <div style={{ fontSize: "22px", fontWeight: "700", marginBottom: "6px", letterSpacing: "-0.5px" }}>{item.value}</div>
                <div style={{ fontSize: "12px", color: item.up === null ? "#8892a4" : item.up ? "#00c853" : "#ff5252" }}>
                  {item.up === true ? "▲ " : item.up === false ? "▼ " : ""}{item.change}
                </div>
              </div>
            ))}
          </div>

          {/* STOCKS TABLE */}
          <div className="fade-up" style={{
            background: "#0d1526", border: "1px solid #1e2d4a",
            borderRadius: "14px", padding: "20px", marginBottom: "24px",
            animationDelay: "0.35s"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#00c853", margin: 0 }}>📊 Live Stocks</h2>
              <span style={{ fontSize: "12px", color: "#8892a4" }}>{stocks.length} listed</span>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: "44px", animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "580px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e2d4a" }}>
                      {["Symbol", "Company", "Sector", "LTP", "Open", "High", "Low", "Volume", "Change%"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "11px", color: "#8892a4", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map(stock => {
                      const price = stock.prices?.[0]
                      const change = getChange(stock)
                      const isUp = change >= 0
                      return (
                        <tr key={stock.symbol} className="stock-row"
                          style={{ borderBottom: "1px solid #1e2d4a" }}
                          onClick={() => window.location.href = `/stock/${stock.symbol}`}>
                          <td style={{ padding: "12px", fontWeight: "700", color: "#00c853", fontSize: "13px" }}>{stock.symbol}</td>
                          <td style={{ padding: "12px", fontSize: "12px", color: "#c8d0dc" }}>{stock.name}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ background: "#1e2d4a", padding: "3px 8px", borderRadius: "5px", fontSize: "11px", color: "#8892a4" }}>{stock.sector}</span>
                          </td>
                          <td style={{ padding: "12px", fontWeight: "700", fontSize: "13px" }}>Rs {price?.close ?? "-"}</td>
                          <td style={{ padding: "12px", fontSize: "12px", color: "#8892a4" }}>Rs {price?.open ?? "-"}</td>
                          <td style={{ padding: "12px", fontSize: "12px", color: "#00c853" }}>Rs {price?.high ?? "-"}</td>
                          <td style={{ padding: "12px", fontSize: "12px", color: "#ff5252" }}>Rs {price?.low ?? "-"}</td>
                          <td style={{ padding: "12px", fontSize: "12px", color: "#8892a4" }}>{price?.volume?.toLocaleString() ?? "-"}</td>
                          <td style={{ padding: "12px", fontWeight: "700", fontSize: "13px", color: isUp ? "#00c853" : "#ff5252" }}>
                            {isUp ? "▲" : "▼"} {Math.abs(change)}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GAINERS & LOSERS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }} className="md:grid-cols-2">
            {[
              { title: "🚀 Top Gainers", color: "#00c853", bg: "rgba(0,200,83,0.05)", sorted: [...stocks].sort((a,b) => getChange(b)-getChange(a)), sign: "+", cls: "gainer-row", delay: "0.45s" },
              { title: "📉 Top Losers",  color: "#ff5252", bg: "rgba(255,82,82,0.05)", sorted: [...stocks].sort((a,b) => getChange(a)-getChange(b)), sign: "-", cls: "loser-row",  delay: "0.5s"  },
            ].map(({ title, color, bg, sorted, sign, cls, delay }) => (
              <div key={title} className="fade-up" style={{
                background: "#0d1526", border: "1px solid #1e2d4a",
                borderRadius: "14px", padding: "20px", animationDelay: delay
              }}>
                <h2 style={{ fontSize: "15px", fontWeight: "600", color, margin: "0 0 16px" }}>{title}</h2>
                {sorted.slice(0, 5).map(stock => (
                  <div key={stock.symbol} className={cls}
                    onClick={() => window.location.href = `/stock/${stock.symbol}`}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 8px", borderRadius: "8px", borderBottom: "1px solid #1e2d4a" }}>
                    <span style={{ fontWeight: "700", color, fontSize: "13px", minWidth: "60px" }}>{stock.symbol}</span>
                    <span style={{ fontSize: "13px", color: "#c8d0dc" }}>Rs {stock.prices?.[0]?.close ?? "-"}</span>
                    <span style={{ fontWeight: "600", fontSize: "13px", color }}>{sign}{Math.abs(getChange(stock))}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}