import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://www.nepalstock.com/api/nots/nepse-data', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.nepalstock.com',
        'Accept': '*/*',
      }
    })

    const data = await res.json()
    const overall = data?.turnover || data?.overall || {}

    return NextResponse.json({
      index: data?.index?.nepse?.toFixed(2) || 'N/A',
      turnover: ((overall.t || 0) / 1e9).toFixed(2) + 'B',
      shares: ((overall.q || 0) / 1e6).toFixed(1) + 'M',
      transactions: (overall.tn || 0).toLocaleString(),
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}