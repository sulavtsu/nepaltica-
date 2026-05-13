import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  let query = supabase
    .from('stocks')
    .select(`
      *,
      prices (*)
    `)
    .order('symbol')

  if (symbol) {
    query = query.eq('symbol', symbol.toUpperCase())
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ stocks: data })
}