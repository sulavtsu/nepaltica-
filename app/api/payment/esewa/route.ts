import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ESEWA_SECRET = process.env.ESEWA_SECRET_KEY!;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE!;

export async function POST(req: NextRequest) {
  const { plan, userId } = await req.json();

  const amount = plan === 'pro' ? 299 : 799;
  const transactionId = `NEP-${userId}-${Date.now()}`;

  const message = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = crypto
    .createHmac('sha256', ESEWA_SECRET)
    .update(message)
    .digest('base64');

  const params = {
    amount: amount.toString(),
    tax_amount: '0',
    total_amount: amount.toString(),
    transaction_uuid: transactionId,
    product_code: ESEWA_PRODUCT_CODE,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/esewa/verify`,
    failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?status=failed`,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
    signature,
  };

  return NextResponse.json({ params, gateway: 'esewa' });
}