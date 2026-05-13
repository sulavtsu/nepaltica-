import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://merolagani.com/handlers/webrequesthandler.ashx?type=market_summary',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://merolagani.com/',
          'Accept': '*/*',
        }
      }
    )

    const data = await res.json()
    console.log('Market data:', JSON.stringify(data).slice(0, 200))

    const turnover = parseFloat(data?.turnover || data?.TotalTurnover || 0)
    const shares = parseInt(data?.totalShares || data?.TotalShares || 0)
    const transactions = parseInt(data?.totalTransactions || data?.TotalTransactions || 0)

    return NextResponse.json({
      turnover: turnover > 0 ? (turnover / 1e9).toFixed(2) + 'B' : 'N/A',
      shares: shares > 0 ? (shares / 1e6).toFixed(1) + 'M' : 'N/A',
      transactions: transactions > 0 ? transactions.toLocaleString() : 'N/A',
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}