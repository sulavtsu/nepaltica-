import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const MEROLAGANI_URL = 'https://merolagani.com/handlers/webrequesthandler.ashx?type=market_summary'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  try {
    const res = await fetch(MEROLAGANI_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://merolagani.com/',
      },
      next: { revalidate: 30 }
    })

    const raw = await res.json()
    const items = raw.turnover?.detail || []

    // If specific symbol requested — return Supabase history + live price
    if (symbol) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Get historical prices from Supabase
      const { data: stockData } = await supabase
        .from('stocks')
        .select('*, prices(*)')
        .eq('symbol', symbol.toUpperCase())
        .single()

      // Get today's live price from Merolagani
      const live = items.find(i => i.s === symbol.toUpperCase())
      const today = new Date().toISOString().split('T')[0]

      let prices = stockData?.prices || []

      // Add today's live price if available
      if (live) {
        prices = prices.filter(p => p.date?.split('T')[0] !== today)
        prices.push({
          date: today,
          open: live.op,
          high: live.h,
          low: live.l,
          close: live.lp,
          volume: live.q,
        })
      }

      return NextResponse.json({
        stocks: [{
          ...stockData,
          prices: prices.sort((a, b) => a.date?.localeCompare(b.date))
        }]
      })
    }

    // No symbol — return all stocks from Merolagani (for homepage)
    const stocks = items.map((item) => ({
      symbol: item.s,
      name: item.n || item.s,
      sector: 'NEPSE',
      prices: [{
        open: item.op,
        high: item.h,
        low: item.l,
        close: item.lp,
        volume: item.q,
        date: new Date().toISOString().split('T')[0],
      }]
    })).filter(s => s.symbol)

    return NextResponse.json({ stocks })

  } catch (err) {
    console.error('Fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch', stocks: [] }, { status: 500 })
  }
}