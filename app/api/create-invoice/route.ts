import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { branchId, totalAmount, bossAmount, branchAmount } = await req.json();

    // Mengambil API Key dari environment variable (.env.local)
    const secretKey = process.env.XENDIT_SECRET_KEY || '';
    const authHeader = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

    // Request Native fetch ke Xendit API v2 Invoices
    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: `INV-${branchId}-${Date.now()}`,
        amount: totalAmount,
        payer_email: 'customer@bisnis.com',
        description: `Pembayaran Transaksi ${branchId}`,
        invoice_duration: 86400, // Expired dalam 24 jam
        metadata: {
          branch_id: branchId,
          boss_amount: bossAmount,
          branch_amount: branchAmount,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Gagal memanggil Xendit' }, { status: response.status });
    }

    // Mengembalikan invoice_url dari UI Xendit
    return NextResponse.json({ invoice_url: data.invoice_url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}