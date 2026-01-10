import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const params = urlObj.searchParams;
    const days = params.get('days');
    const from = params.get('from');
    const to = params.get('to');

    let url = '';
    const now = Math.floor(Date.now() / 1000);
    if (from && to) {
      url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
    } else if (days) {
      if (days === 'max') {
        // use range endpoint from epoch to now for all-time
        url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=0&to=${now}`;
      } else {
        url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`;
      }
    } else {
      url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily`;
    }

    const fetchRes = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'btc-elements/1.0 (+http://localhost)',
      },
    });

    const contentType = fetchRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await fetchRes.json();

      // CoinGecko public API limits historical queries to 365 days (error_code 10012).
      // If we receive that error, retry with 365 days and inform the client via header.
      const errCode = data?.error?.status?.error_code;
      if (errCode === 10012) {
        const fallbackUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'btc-elements/1.0 (+http://localhost)',
          },
        });
        const fallbackData = await fallbackRes.json();
        return NextResponse.json(fallbackData, {
          status: fallbackRes.status,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            'X-Fallback': 'true',
            'X-Fallback-Reason': 'exceeds_365',
          },
        });
      }

      return NextResponse.json(data, {
        status: fetchRes.status,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    // non-json response (useful for debugging 401 bodies)
    const text = await fetchRes.text();
    return NextResponse.json({ error: text }, { status: fetchRes.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
