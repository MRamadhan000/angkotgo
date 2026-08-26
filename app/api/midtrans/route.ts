import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      orderId,
      amount,
      name,
      email,
      phone,
    } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        {
          error: 'orderId dan amount wajib diisi',
        },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
      return NextResponse.json(
        {
          error: 'MIDTRANS_SERVER_KEY belum diatur',
        },
        { status: 500 }
      );
    }

    const auth = Buffer.from(
      `${serverKey}:`
    ).toString('base64');

    const response = await fetch(
      'https://api.sandbox.midtrans.com/v2/charge',
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },

        body: JSON.stringify({
          payment_type: 'qris',

          transaction_details: {
            order_id: orderId,
            gross_amount: amount,
          },

          qris: {
            acquirer: 'gopay',
          },

          customer_details: {
            first_name: name,
            email,
            phone,
          },

          item_details: [
            {
              id: 'RENTAL-001',
              price: amount,
              quantity: 1,
              name: 'Test Rental',
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log('MIDTRANS RESPONSE:', data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.status_message ||
            'Gagal membuat QRIS',

          detail: data,
        },
        {
          status: response.status,
        }
      );
    }

    /*
     * Cari URL QR dari actions Midtrans
     */
    const qrAction = data.actions?.find(
      (action: any) =>
        action.name === 'generate-qr-code'
    );

    const qrActionV2 = data.actions?.find(
      (action: any) =>
        action.name === 'generate-qr-code-v2'
    );

    const qrUrl =
      qrActionV2?.url ||
      qrAction?.url ||
      null;

    return NextResponse.json({
      success: true,

      order_id: data.order_id,

      transaction_id:
        data.transaction_id,

      transaction_status:
        data.transaction_status,

      payment_type:
        data.payment_type,

      gross_amount:
        data.gross_amount,

      acquirer:
        data.acquirer,

      qr_url: qrUrl,

      actions: data.actions,
    });
  } catch (error: any) {
    console.error(
      'MIDTRANS ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}