import { NextResponse } from 'next/server'

const MEROLAGANI_URL = 'https://merolagani.com/handlers/webrequesthandler.ashx?type=market_summary'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  try {
    const res = await fetch(MEROLAGANI_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://merolagani.com/',
      },
      next: { revalidate: 30 }
    })

    const raw = await res.json()
    const items = raw.turnover?.detail || []

    let stocks = items.map((item) => ({
      symbol: item.s,
      name:   item.n || item.s,
      sector: 'NEPSE',
      prices: [{
        open:   item.op,
        high:   item.h,
        low:    item.l,
        close:  item.lp,
        volume: item.q,
        change: item.pc,
        date:   new Date().toISOString().split('T')[0],
      }]
    })).filter(s => s.symbol)

    if (symbol) {
      stocks = stocks.filter(s => s.symbol === symbol.toUpperCase())
    }

    return NextResponse.json({ stocks })

  } catch (err) {
    console.error('Merolagani fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch live data', stocks: [] }, { status: 500 })
  }
}