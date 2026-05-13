import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { searchParams } = new URL(req.url);
  const data = searchParams.get('data');

  if (!data) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?status=failed`
    );
  }

  try {
    const decoded = JSON.parse(Buffer.from(data, 'base64').toString());
    const { transaction_uuid, status, total_amount } = decoded;

    if (status !== 'COMPLETE') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/pricing?status=failed`
      );
    }

    const userId = transaction_uuid.split('-')[1];
    const plan = total_amount == 299 ? 'pro' : 'premium';

    await supabase
      .from('users')
      .update({ plan, plan_activated_at: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=success&plan=${plan}`
    );
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?status=failed`
    );
  }
}