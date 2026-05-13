import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const res = await fetch("https://www.nepalstock.com/api/nots/nepse-data", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.nepalstock.com',
        'Accept': '*/*',
      }
    })

    const data = await res.json()
    const stocks = data?.turnover?.detail || data?.detail || []
    const today = new Date().toISOString().split('T')[0]
    let saved = 0

    for (const stock of stocks) {
      if (!stock.s || !stock.lp) continue

      await supabase.from('stocks').upsert(
        { symbol: stock.s, name: stock.n || stock.s, sector: 'Unknown' },
        { onConflict: 'symbol', ignoreDuplicates: true }
      )

      await supabase.from('prices').upsert(
        {
          symbol: stock.s,
          date: today,
          open: stock.op,
          high: stock.h,
          low: stock.l,
          close: stock.lp,
          volume: stock.q
        },
        { onConflict: 'symbol,date' }
      )

      saved++
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${saved} stocks`,
      total: stocks.length
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}