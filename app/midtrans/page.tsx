'use client';

import { useState } from 'react';

interface PaymentResult {
  success: boolean;
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  payment_type: string;
  gross_amount: string;
  acquirer: string;
  qr_url: string | null;
}

export default function Home() {
  const [loading, setLoading] =
    useState(false);

  const [payment, setPayment] =
    useState<PaymentResult | null>(null);

  const [error, setError] =
    useState('');

  async function handlePayment() {
    setLoading(true);
    setError('');
    setPayment(null);

    try {
      const response = await fetch(
        '/api/midtrans',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            orderId: `RENTAL-${Date.now()}`,

            amount: 10000,

            name: 'Titan',

            email:
              'titan@example.com',

            phone:
              '081234567890',
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Gagal membuat pembayaran'
        );
      }

      setPayment(data);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          'Terjadi kesalahan'
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadQR() {
    if (!payment?.qr_url) return;

    const link =
      document.createElement('a');

    link.href = payment.qr_url;

    link.download =
      `${payment.order_id}-QRIS.png`;

    link.target = '_blank';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent:
          'center',
        alignItems: 'center',
        background: '#f5f7fb',
        padding: 20,
        fontFamily:
          'Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 430,
          background: '#fff',
          borderRadius: 20,
          padding: 30,
          boxShadow:
            '0 15px 40px rgba(0,0,0,.08)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
          }}
        >
          Pembayaran Rental
        </h1>

        <p
          style={{
            color: '#777',
            marginTop: 8,
          }}
        >
          Bayar menggunakan QRIS
        </p>

        {/* PRODUCT */}

        <div
          style={{
            marginTop: 25,
            padding: 20,
            borderRadius: 14,
            background: '#f7f8fa',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
            }}
          >
            <span>
              Produk
            </span>

            <strong>
              Test Rental
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              marginTop: 15,
            }}
          >
            <span>
              Total
            </span>

            <strong
              style={{
                fontSize: 20,
              }}
            >
              Rp10.000
            </strong>
          </div>
        </div>

        {/* PAYMENT BUTTON */}

        {!payment && (
          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 25,
              padding: 16,
              border: 'none',
              borderRadius: 12,
              background:
                loading
                  ? '#aaa'
                  : '#111',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor:
                loading
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {loading
              ? 'Membuat QRIS...'
              : 'Bayar Sekarang'}
          </button>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 10,
              background: '#fee2e2',
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        {/* QRIS */}

        {payment?.qr_url && (
          <div
            style={{
              marginTop: 25,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                padding: 20,
                border:
                  '1px solid #eee',
                borderRadius: 16,
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                }}
              >
                Scan QRIS
              </h2>

              <p
                style={{
                  color: '#777',
                  fontSize: 14,
                }}
              >
                Scan menggunakan
                aplikasi pembayaran
                yang mendukung QRIS
              </p>

              <img
                src={payment.qr_url}
                alt="QRIS"
                style={{
                  width: 260,
                  height: 260,
                  objectFit: 'contain',
                  margin:
                    '15px auto',
                  display: 'block',
                }}
              />

              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: '#777',
                }}
              >
                Order ID
              </div>

              <strong>
                {payment.order_id}
              </strong>

              <div
                style={{
                  marginTop: 15,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                Rp10.000
              </div>

              <button
                onClick={downloadQR}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: 14,
                  border:
                    '1px solid #111',
                  borderRadius: 10,
                  background: '#fff',
                  color: '#111',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Download QR
              </button>
            </div>

            {/* STATUS */}

            <div
              style={{
                marginTop: 15,
                padding: 15,
                borderRadius: 10,
                background: '#f7f7f7',
                fontSize: 14,
              }}
            >
              Status:{' '}
              <strong>
                {payment.transaction_status}
              </strong>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}