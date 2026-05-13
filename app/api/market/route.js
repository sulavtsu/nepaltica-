import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  try {
    const { data } = await axios.get(
      'https://merolagani.com/handlers/webrequesthandler.ashx?type=market_summary',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://merolagani.com/',
          'Accept': '*/*',
        },
        timeout: 10000
      }
    )

    const overall = data?.overall || {}
    const turnover = parseFloat(overall.t || 0)
    const shares = parseInt(overall.q || 0)
    const transactions = parseInt(overall.tn || 0)

    return NextResponse.json({
      turnover: (turnover / 1e9).toFixed(2) + 'B',
      shares: (shares / 1e6).toFixed(1) + 'M',
      transactions: transactions.toLocaleString(),
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}