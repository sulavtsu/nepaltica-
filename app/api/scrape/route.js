import { NextResponse } from 'next/server'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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