import { NextResponse } from 'next/server'

const MEROLAGANI_URL = 'https://merolagani.com/handlers/webrequesthandler.ashx?type=market_summary'

export async function GET() {
  try {
    const res = await fetch(MEROLAGANI_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://merolagani.com/',
      },
      next: { revalidate: 30 }
    })

    const raw = await res.json()
    const overall = raw.overall || {}

    const turnover   = parseFloat(overall.t || 0)
    const shares     = parseInt(overall.q || 0)
    const transactions = parseInt(overall.tn || 0)

    return NextResponse.json({
  turnover:    (turnover / 1e9).toFixed(2) + 'B',
  shares:      (shares / 1e6).toFixed(1) + 'M',
  transactions: transactions.toLocaleString(),
  index:       parseFloat(overall.ci || 0).toFixed(2),
  indexChange: overall.cp ? `${overall.cp > 0 ? '+' : ''}${overall.cp}` : 'Live',
  marketCap:   overall.mc ? 'Rs ' + (parseFloat(overall.mc) / 1e12).toFixed(2) + 'T' : '...',
})

  } catch (err) {
    console.error('Market fetch failed:', err)
    return NextResponse.json({ turnover: '-', shares: '-', transactions: '-' }, { status: 500 })
  }
}