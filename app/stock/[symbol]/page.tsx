'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

const styles = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .stat-box { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
  .stat-box:hover { transform: translateY(-3px); border-color: #00c853 !important; box-shadow: 0 0 16px rgba(0,200,83,0.12); }
  .nav-link { transition: color 0.2s ease; }
  .nav-link:hover { color: #ffffff !important; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .live-dot { animation: pulse 1.5s ease-in-out infinite; }
  .tab-btn { padding: 8px 18px; border-radius: 8px; border: 1px solid #1e2d4a; background: transparent; color: #8892a4; font-size: 13px; cursor: pointer; transition: all 0.2s ease; }
  .tab-btn.active { background: #00c853; color: black; border-color: #00c853; font-weight: 700; }
  .tab-btn:hover:not(.active) { border-color: #00c853; color: #00c853; }
`

// Calculate RSI
function calcRSI(closes: number[], period = 14): number[] {
  const rsi: number[] = new Array(period).fill(0)
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }
  let avgGain = gains / period
  let avgLoss = losses / period
  rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period
    rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  }
  return rsi
}

// Calculate EMA
function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const ema: number[] = [data[0]]
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k))
  }
  return ema
}

// Calculate MACD
function calcMACD(closes: number[]) {
  const ema12 = calcEMA(closes, 12)
  const ema26 = calcEMA(closes, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signal = calcEMA(macdLine.slice(25), 9)
  return { macdLine: macdLine.slice(25), signal, startIndex: 25 }
}

export default function StockPage() {
  const { symbol } = useParams()
  const [stock, setStock] = useState<any>(null)
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'candle' | 'rsi' | 'macd' | 'volume'>('candle')
  const chartRef = useRef<HTMLDivElement>(null)
  const rsiRef = useRef<HTMLDivElement>(null)
  const macdRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    fetch(`/api/stocks?symbol=${symbol}`)
      .then(r => r.json())
      .then(data => {
        if (data.stocks?.length > 0) {
          setStock(data.stocks[0])
          setPrices([...(data.stocks[0].prices || [])].reverse())
        }
        setLoading(false)
      })
  }, [symbol])

  useEffect(() => {
    if (!prices.length || !chartRef.current) return

    import('lightweight-charts').then(({ createChart, CandlestickSeries, LineSeries, HistogramSeries }) => {
      if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null }

      const candleData = prices
        .filter(p => p.date && p.open && p.high && p.low && p.close)
        .map(p => ({
          time: p.date.split('T')[0],
          open: Number(p.open),
          high: Number(p.high),
          low: Number(p.low),
          close: Number(p.close),
          volume: Number(p.volume || 0),
        }))
        .sort((a, b) => a.time.localeCompare(b.time))

      const closes = candleData.map(d => d.close)

      if (activeTab === 'candle' && chartRef.current) {
        const chart = createChart(chartRef.current, {
          width: chartRef.current.clientWidth,
          height: 400,
          layout: { background: { color: '#0d1526' }, textColor: '#8892a4' },
          grid: { vertLines: { color: '#1e2d4a' }, horzLines: { color: '#1e2d4a' } },
          crosshair: { mode: 1 },
          rightPriceScale: { borderColor: '#1e2d4a' },
          timeScale: { borderColor: '#1e2d4a', timeVisible: true },
        })
        const candles = chart.addSeries(CandlestickSeries, {
          upColor: '#00c853', downColor: '#ff5252',
          borderUpColor: '#00c853', borderDownColor: '#ff5252',
          wickUpColor: '#00c853', wickDownColor: '#ff5252',
        })
        candles.setData(candleData)
        chart.timeScale().fitContent()
        chartInstance.current = chart

      } else if (activeTab === 'volume' && chartRef.current) {
        const chart = createChart(chartRef.current, {
          width: chartRef.current.clientWidth, height: 400,
          layout: { background: { color: '#0d1526' }, textColor: '#8892a4' },
          grid: { vertLines: { color: '#1e2d4a' }, horzLines: { color: '#1e2d4a' } },
          rightPriceScale: { borderColor: '#1e2d4a' },
          timeScale: { borderColor: '#1e2d4a', timeVisible: true },
        })
        const vol = chart.addSeries(HistogramSeries, { color: '#1e2d4a', priceFormat: { type: 'volume' } })
        vol.setData(candleData.map(d => ({ time: d.time, value: d.volume, color: d.close >= d.open ? '#00c85366' : '#ff525266' })))
        chart.timeScale().fitContent()
        chartInstance.current = chart

      } else if (activeTab === 'rsi' && rsiRef.current && closes.length > 14) {
        const rsiValues = calcRSI(closes)
        const chart = createChart(rsiRef.current, {
          width: rsiRef.current.clientWidth, height: 300,
          layout: { background: { color: '#0d1526' }, textColor: '#8892a4' },
          grid: { vertLines: { color: '#1e2d4a' }, horzLines: { color: '#1e2d4a' } },
          rightPriceScale: { borderColor: '#1e2d4a' },
          timeScale: { borderColor: '#1e2d4a', timeVisible: true },
        })
        const rsiLine = chart.addSeries(LineSeries, { color: '#7c3aed', lineWidth: 2 })
        const ob = chart.addSeries(LineSeries, { color: '#ff5252', lineWidth: 1, lineStyle: 2 })
        const os = chart.addSeries(LineSeries, { color: '#00c853', lineWidth: 1, lineStyle: 2 })
        rsiLine.setData(candleData.map((d, i) => ({ time: d.time, value: rsiValues[i] ?? 50 })))
        ob.setData(candleData.map(d => ({ time: d.time, value: 70 })))
        os.setData(candleData.map(d => ({ time: d.time, value: 30 })))
        chart.timeScale().fitContent()
        chartInstance.current = chart

      } else if (activeTab === 'macd' && macdRef.current && closes.length > 35) {
        const { macdLine, signal, startIndex } = calcMACD(closes)
        const slicedData = candleData.slice(startIndex)
        const chart = createChart(macdRef.current, {
          width: macdRef.current.clientWidth, height: 300,
          layout: { background: { color: '#0d1526' }, textColor: '#8892a4' },
          grid: { vertLines: { color: '#1e2d4a' }, horzLines: { color: '#1e2d4a' } },
          rightPriceScale: { borderColor: '#1e2d4a' },
          timeScale: { borderColor: '#1e2d4a', timeVisible: true },
        })
        const macdSeries = chart.addSeries(LineSeries, { color: '#00c853', lineWidth: 2 })
        const signalSeries = chart.addSeries(LineSeries, { color: '#ff5252', lineWidth: 2 })
        const histSeries = chart.addSeries(HistogramSeries, { color: '#1e2d4a' })
        macdSeries.setData(slicedData.map((d, i) => ({ time: d.time, value: macdLine[i] ?? 0 })))
        signalSeries.setData(slicedData.map((d, i) => ({ time: d.time, value: signal[i] ?? 0 })))
        histSeries.setData(slicedData.map((d, i) => ({ time: d.time, value: (macdLine[i] ?? 0) - (signal[i] ?? 0), color: (macdLine[i] ?? 0) >= (signal[i] ?? 0) ? '#00c85366' : '#ff525266' })))
        chart.timeScale().fitContent()
        chartInstance.current = chart
      }

      const handleResize = () => {
        const ref = activeTab === 'rsi' ? rsiRef.current : activeTab === 'macd' ? macdRef.current : chartRef.current
        if (ref && chartInstance.current) chartInstance.current.applyOptions({ width: ref.clientWidth })
      }
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    })
  }, [prices, activeTab])

  if (loading) return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>📈</div>
        <div style={{ color: "#8892a4" }}>Loading {symbol}...</div>
      </div>
    </div>
  )

  if (!stock) return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>❌</div>
        <div>Stock not found</div>
        <a href="/" style={{ color: "#00c853", marginTop: "16px", display: "block" }}>← Back to Market</a>
      </div>
    </div>
  )

  const price = prices[prices.length - 1]
  const change = price ? (((price.close - price.open) / price.open) * 100).toFixed(2) : '0'
  const isUp = Number(change) >= 0

  return (
    <>
      <style>{styles}</style>
      <div style={{ background: "#0a0f1e", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>

        {/* NAVBAR */}
        <nav style={{ background: "#0d1526", borderBottom: "1px solid #1e2d4a", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
            <a href="/" style={{ fontSize: "22px", fontWeight: "bold", color: "#00c853", textDecoration: "none" }}>🏔️ Nepaltica</a>
            <div className="hidden md:flex" style={{ gap: "32px", fontSize: "14px" }}>
              <a href="/" className="nav-link no-underline" style={{ color: "#8892a4" }}>Market</a>
              <a href="/ai-analyst" className="nav-link no-underline" style={{ color: "#8892a4" }}>AI Analyst</a>
              <a href="/pricing" className="nav-link no-underline" style={{ color: "#8892a4" }}>Pricing</a>
            </div>
            <div className="hidden md:flex" style={{ gap: "12px" }}>
              <a href="/login" className="no-underline" style={{ color: "#00c853", border: "1px solid #00c853", padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>Login</a>
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
              <a href="/" className="nav-link no-underline" style={{ color: "#8892a4", fontSize: "15px" }}>Market</a>
              <a href="/ai-analyst" className="nav-link no-underline" style={{ color: "#8892a4", fontSize: "15px" }}>AI Analyst</a>
              <a href="/pricing" className="nav-link no-underline" style={{ color: "#8892a4", fontSize: "15px" }}>Pricing</a>
            </div>
          )}
        </nav>

        <div style={{ padding: "24px" }}>
          <a href="/" className="fade-up no-underline" style={{ color: "#8892a4", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00c853")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8892a4")}>
            ← Back to Market
          </a>

          {/* STOCK HEADER */}
          <div className="fade-up" style={{ marginBottom: "24px", animationDelay: "0.05s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ width: "48px", height: "48px", background: "#1e2d4a", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#00c853", fontSize: "14px" }}>
                {String(symbol).slice(0, 2)}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", letterSpacing: "-0.5px" }}>{symbol}</h1>
                <div style={{ color: "#8892a4", fontSize: "14px" }}>{stock.name} · {stock.sector}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: "700" }}>Rs {price?.close ?? "-"}</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: isUp ? "#00c853" : "#ff5252" }}>
                  {isUp ? "▲" : "▼"} {Math.abs(Number(change))}% today
                </div>
              </div>
            </div>
          </div>

          {/* STAT BOXES */}
          <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "24px", animationDelay: "0.1s" }}>
            {[
              { label: "Open",   value: `Rs ${price?.open  ?? "-"}`, color: "#ffffff" },
              { label: "Close",  value: `Rs ${price?.close ?? "-"}`, color: isUp ? "#00c853" : "#ff5252" },
              { label: "High",   value: `Rs ${price?.high  ?? "-"}`, color: "#00c853" },
              { label: "Low",    value: `Rs ${price?.low   ?? "-"}`, color: "#ff5252" },
              { label: "Volume", value: price?.volume?.toLocaleString() ?? "-", color: "#ffffff" },
              { label: "Change", value: `${isUp ? "+" : ""}${change}%`, color: isUp ? "#00c853" : "#ff5252" },
            ].map((s, i) => (
              <div key={i} className="stat-box" style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "12px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: "#8892a4", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* CHART SECTION */}
          <div className="fade-up" style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "14px", padding: "20px", marginBottom: "24px", animationDelay: "0.2s" }}>
            
            {/* CHART HEADER */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="live-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00c853", display: "inline-block" }} />
                <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#00c853" }}>Technical Chart</h2>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { key: 'candle', label: '🕯️ Candles' },
                  { key: 'volume', label: '📊 Volume' },
                  { key: 'rsi',    label: '📉 RSI' },
                  { key: 'macd',   label: '〰️ MACD' },
                ].map(tab => (
                  <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key as any)}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RSI INFO */}
            {activeTab === 'rsi' && (
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "#7c3aed" }}>— RSI(14)</span>
                <span style={{ fontSize: "12px", color: "#ff5252" }}>-- Overbought (70)</span>
                <span style={{ fontSize: "12px", color: "#00c853" }}>-- Oversold (30)</span>
              </div>
            )}

            {/* MACD INFO */}
            {activeTab === 'macd' && (
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", color: "#00c853" }}>— MACD Line</span>
                <span style={{ fontSize: "12px", color: "#ff5252" }}>— Signal Line</span>
                <span style={{ fontSize: "12px", color: "#8892a4" }}>█ Histogram</span>
              </div>
            )}

            {/* NOT ENOUGH DATA WARNING */}
            {activeTab === 'rsi' && prices.length <= 14 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#8892a4" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
                <div>Need 14+ days of data for RSI</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Currently have {prices.length} day(s)</div>
              </div>
            )}
            {activeTab === 'macd' && prices.length <= 35 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#8892a4" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
                <div>Need 35+ days of data for MACD</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Currently have {prices.length} day(s)</div>
              </div>
            )}

            {/* CHART CONTAINERS */}
            <div ref={chartRef} style={{ width: "100%", borderRadius: "8px", overflow: "hidden", display: activeTab === 'candle' || activeTab === 'volume' ? 'block' : 'none' }} />
            <div ref={rsiRef}   style={{ width: "100%", borderRadius: "8px", overflow: "hidden", display: activeTab === 'rsi' && prices.length > 14 ? 'block' : 'none' }} />
            <div ref={macdRef}  style={{ width: "100%", borderRadius: "8px", overflow: "hidden", display: activeTab === 'macd' && prices.length > 35 ? 'block' : 'none' }} />
          </div>

          {/* PRICE HISTORY TABLE */}
          <div className="fade-up" style={{ background: "#0d1526", border: "1px solid #1e2d4a", borderRadius: "14px", padding: "20px", animationDelay: "0.3s" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "600", color: "#00c853" }}>📋 Price History</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e2d4a" }}>
                    {["Date", "Open", "High", "Low", "Close", "Volume"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...prices].reverse().map((p, i) => {
                    const dayChange = (((p.close - p.open) / p.open) * 100).toFixed(2)
                    const dayUp = Number(dayChange) >= 0
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #1e2d4a" }}>
                        <td style={{ padding: "10px 12px", fontSize: "13px", color: "#8892a4" }}>{p.date?.split('T')[0]}</td>
                        <td style={{ padding: "10px 12px", fontSize: "13px" }}>Rs {p.open}</td>
                        <td style={{ padding: "10px 12px", fontSize: "13px", color: "#00c853" }}>Rs {p.high}</td>
                        <td style={{ padding: "10px 12px", fontSize: "13px", color: "#ff5252" }}>Rs {p.low}</td>
                        <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: "700", color: dayUp ? "#00c853" : "#ff5252" }}>Rs {p.close}</td>
                        <td style={{ padding: "10px 12px", fontSize: "13px", color: "#8892a4" }}>{p.volume?.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}