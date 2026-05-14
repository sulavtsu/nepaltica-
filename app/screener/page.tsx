'use client'
import { useEffect, useState } from 'react'

const styles = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp 0.4s ease both; }
  .stock-row { transition: background 0.15s ease; cursor: pointer; }
  .stock-row:hover { background: #162035; }
  .filter-btn { transition: all 0.2s ease; cursor: pointer; border: 1px solid #1e2d4a; background: #0d1526; color: #8892a4; padding: 8px 16px; border-radius: 8px; font-size: 13px; }
  .filter-btn.active { background: #00c853; color: black; border-color: #00c853; font-weight: 700; }
  .filter-btn:hover:not(.active) { border-color: #00c853; color: #00c853; }
  .range-input { width: 100%; accent-color: #00c853; cursor: pointer; }
  .nav-link { transition: color 0.2s ease; }
  .nav-link:hover { color: #fff !important; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .live-dot { animation: pulse 1.5s ease-in-out infinite; }
`

const SECTORS = ['All', 'Banking', 'Hydro Power', 'Insurance', 'Telecom', 'Manufacturing', 'Finance']

export default function Screener() {
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sector, setSector] = useState('All')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [changeFilter, setChangeFilter] = useState<'all' | 'gainers' | 'losers'>('all')
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'volume'>('change')
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/stocks')
      .then(r => r.json())
      .then(d => { setStocks(d.stocks || []); setLoading(false) })
  }, [])

  const getChange = (stock: any) => {
    if (!stock.prices?.length) return 0
    const p = stock.prices[0]
    if (!p.open || p.open === 0) return 0
    return parseFloat((((p.close - p.open) / p.open) * 100).toFixed(2))
  }

  const filtered = stocks
    .filter(s => {
      const price = s.prices?.[0]?.close ?? 0
      const change = getChange(s)
      const matchSector = sector === 'All' || s.sector === sector
      const matchPrice = price >= minPrice && price <= maxPrice
      const matchChange = changeFilter === 'all' || (changeFilter === 'gainers' ? change >= 0 : change < 0)
      const matchSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())
      return matchSector && matchPrice && matchChange && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol)
      if (sortBy === 'price') return (b.prices?.[0]?.close ?? 0) - (a.prices?.[0]?.close ?? 0)
      if (sortBy === 'change') return Math.abs(getChange(b)) - Math.abs(getChange(a))
      if (sortBy === 'volume') return (b.prices?.[0]?.volume ?? 0) - (a.prices?.[0]?.volume ?? 0)
      return 0
    })

  return (
    <>
      <style>{styles}</style>
      <div style={{ background: "#0a0f1e", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>

        {/* NAVBAR */}
        <nav style={{ background: "#0d1526", borderBottom: "1px solid #1e2d4a", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
            <a href="/" style={{ fontSize: "22px", fontWeight: "bold", color: "#00c853", textDecoration: "none" }}>🏔️ Nepaltica</a>
            <div className="hidden md:flex" style={{ gap: "32px", fontSize: "14px" }}>
              <a href="/"          className="nav-link no-underline" style={{ color: "#8892a4" }}>Market</a>
              <a href="/screener"  className="nav-link no-underline" style={{ color: "#00c853" }}>Screener</a>
              <a href="/ai-analyst" className="nav-link no-underline" style={{ color: "#8892a4" }}>AI Analyst</a>
              <a href="/pricing"   className="nav-link no-underline" style={{ color: "#8892a4" }}>Pricing</a>
            </div>
            <div className="hidden md:flex" style={{ gap: "12px" }}>
              <a href="/login"   className="no-underline" style={{ color: "#00c853", border: "1px solid #00c853", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>Login</a>
              <a href="/pricing" className="no-underline" style={{ background: "#00c853", color: "black", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "700" }}>Get Pro ✦</a>
            </div>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px", padding: "8px" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display: "block", width: "22px", height: "2px", background: "#00c853", borderRadius: "2px", transition: "all 0.3s ease",
                  transform: menuOpen && i===0 ? "rotate(45deg) translate(5px,5px)" : menuOpen && i===1 ? "scaleX(0)" : menuOpen && i===2 ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
              ))}
            </button>
          </div>
          {menuOpen && (
            <div style={{ borderTop: "1px solid #1e2d4a", padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
              <a href="/"           style={{ color: "#8892a4", textDecoration: "none", fontSize: "15px" }}>Market</a>
              <a href="/screener"   style={{ color: "#00c853", textDecoration: "none", fontSize: "15px" }}>Screener</a>
              <a href="/ai-analyst" style={{ color: "#8892a4", textDecoration: "none", fontSize: "15px" }}>AI Analyst</a>
              <a href="/pricing"    style={{ color: "#8892a4", textDecoration: "none", fontSize: "15px" }}>Pricing</a>
            </div>
          )}
        </nav>

        <div style={{ padding: "24px" }}>

          {/* HEADER */}
          <div className="fade-up" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="live-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00c853", display: "inline-block" }} />
              <span style={{ fontSize: "12px", color: "#8892a4", letterSpacing: "0.05em" }}>LIVE</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "700", letterSpacing: "-0.5px" }}>Stock Screener</h1>
            <p style={{ margin: "4px 0 0", color: "#8892a4", fontSize: "14px" }}>Filter and sort all NEPSE listed stocks</p>
          </div>

          {/* FILTERS */}
          <div className="fade-up" style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "14px", padding: "20px", marginBottom: "20px", animationDelay: "0.1s" }}>
            
            {/* SEARCH */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>Search</label>
              <input
                type="text"
                placeholder="Symbol or company name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1e2d4a", borderRadius: "8px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#00c853"}
                onBlur={e => e.target.style.borderColor = "#1e2d4a"}
              />
            </div>

            {/* SECTOR */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "10px" }}>Sector</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {SECTORS.map(s => (
                  <button key={s} className={`filter-btn ${sector === s ? 'active' : ''}`} onClick={() => setSector(s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* CHANGE FILTER */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "10px" }}>Performance</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(['all', 'gainers', 'losers'] as const).map(f => (
                  <button key={f} className={`filter-btn ${changeFilter === f ? 'active' : ''}`} onClick={() => setChangeFilter(f)}>
                    {f === 'all' ? 'All' : f === 'gainers' ? '🚀 Gainers' : '📉 Losers'}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE RANGE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                  Min Price: <span style={{ color: "#00c853" }}>Rs {minPrice}</span>
                </label>
                <input type="range" className="range-input" min={0} max={5000} step={50} value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
                  Max Price: <span style={{ color: "#00c853" }}>Rs {maxPrice}</span>
                </label>
                <input type="range" className="range-input" min={0} max={5000} step={50} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* RESULTS HEADER */}
          <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "12px", animationDelay: "0.2s" }}>
            <span style={{ fontSize: "14px", color: "#8892a4" }}>
              Showing <span style={{ color: "#00c853", fontWeight: "700" }}>{filtered.length}</span> of {stocks.length} stocks
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#8892a4" }}>Sort by:</span>
              {(['symbol', 'price', 'change', 'volume'] as const).map(s => (
                <button key={s} className={`filter-btn ${sortBy === s ? 'active' : ''}`}
                  style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => setSortBy(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* RESULTS TABLE */}
          <div className="fade-up" style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "14px", padding: "20px", animationDelay: "0.25s" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#8892a4" }}>Loading stocks...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
                <div style={{ color: "#8892a4" }}>No stocks match your filters</div>
                <button onClick={() => { setSector('All'); setChangeFilter('all'); setMinPrice(0); setMaxPrice(5000); setSearch('') }}
                  style={{ marginTop: "16px", background: "#00c853", color: "black", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e2d4a" }}>
                      {["Symbol", "Company", "Sector", "LTP", "High", "Low", "Volume", "Change%"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(stock => {
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
        </div>
      </div>
    </>
  )
}