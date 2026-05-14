import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Fetch today's NEPSE index from Merolagani
  const res = await fetch(
    'https://merolagani.com/handlers/webrequesthandler.ashx?type=market_summary',
    { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://merolagani.com/' } }
  )
  const data = await res.json()
  const todayValue = data?.overall?.ci

  // Save today's value to Supabase
  const today = new Date().toISOString().split('T')[0]
  if (todayValue) {
    await supabase.from('nepse_index').upsert(
      { date: today, value: todayValue },
      { onConflict: 'date' }
    )
  }

  // Return last 90 days of history
  const { data: history } = await supabase
    .from('nepse_index')
    .select('date, value')
    .order('date', { ascending: true })
    .limit(90)

  return NextResponse.json({ history, today: todayValue })
}