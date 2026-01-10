'use client';

import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type CoinGeckoMarketChart = {
  prices: [number, number][]; // [timestamp, price]
};

export default function ChartCoinGecko() {
  const [prices, setPrices] = useState<CoinGeckoMarketChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'1' | '7' | '30' | '365'>('7');

  useEffect(() => {
    let mounted = true;
    async function fetchPrices() {
      setLoading(true);
      setError(null);
      try {
        const now = Math.floor(Date.now() / 1000);
        const daysNum = parseInt(range, 10);
        let url: string;
        if (range === '1' || (Number.isFinite(daysNum) && daysNum > 90)) {
          // For 1d and large ranges (e.g. 365), use the range endpoint via proxy
          const from = now - daysNum * 24 * 60 * 60;
          const to = now;
          url = `/api/coin-gecko?from=${from}&to=${to}`;
        } else {
          url = `/api/coin-gecko?days=${daysNum}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: CoinGeckoMarketChart = await res.json();

        if (mounted) setPrices(json);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (mounted) setError(msg || 'Failed to fetch price data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPrices();
    return () => {
      mounted = false;
    };
  }, [range]);

  const labels = useMemo(() => {
    if (!prices) return [] as string[];
    const toMillis = (ts: number) => (ts < 1e12 ? ts * 1000 : ts);
    return prices.prices.map((p) => {
      const d = new Date(toMillis(p[0]));
      if (range === '1') {
        return d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      if (range === '365') {
        return d.toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric',
        });
      }
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    });
  }, [prices, range]);

  const data = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: 'BTC Price (USD)',
          data: prices ? prices.prices.map((p) => Number(p[1].toFixed(2))) : [],
          borderColor: '#f97316',
          borderWidth: 3,
          backgroundColor: 'rgba(249,115,22,0.12)',
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: true,
        },
      ],
    };
  }, [labels, prices]);

  const options = useMemo(() => {
    const labelMap: Record<string, string> = {
      '1': '24 hours',
      '7': '7 days',
      '30': '30 days',
      '365': '1 year',
    };
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: { borderWidth: 3 },
        point: { radius: 0 },
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { display: false } },
        y: {
          grid: { color: 'rgba(0,0,0,0.06)' },
          beginAtZero: false,
          ticks: { display: false },
        },
      },
    };
  }, [range]);

  return (
    <section style={{ maxWidth: 720, margin: '16px auto', padding: 8 }}>
      <div
        style={{
          height: 360,
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={`Chart: BTC price last ${range} days`}
      >
        {loading && <p>Loading BTC price data…</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        {!loading && !error && prices && <Line data={data} options={options} />}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 12,
          padding: 6,
          borderRadius: 9999,
          background: '#0b1220',
        }}
      >
        {(
          [
            { key: '1', label: 'Day' },
            { key: '7', label: 'Week' },
            { key: '30', label: 'Month' },
            { key: '365', label: 'Year' },
          ] as { key: '1' | '7' | '30' | '365'; label: string }[]
        ).map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            aria-pressed={range === r.key}
            style={{
              padding: '6px 10px',
              height: 32,
              lineHeight: '20px',
              borderRadius: 9999,
              border:
                range === r.key
                  ? '1px solid rgba(249,115,22,0.16)'
                  : '1px solid transparent',
              background: range === r.key ? '#f97316' : 'transparent',
              color: range === r.key ? '#ffffff' : '#cbd5e1',
              cursor: 'pointer',
              boxShadow:
                range === r.key ? '0 6px 12px rgba(249,115,22,0.08)' : 'none',
              margin: 6,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
    </section>
  );
}
