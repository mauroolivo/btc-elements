'use client';
import { ChartCoinGecko } from '@features/chart';

export default function ChartPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
      <section className="core-surface rounded-3xl p-6">
        <h1 className="text-3xl font-semibold text-white">Chart Page</h1>
        <div className="mt-6">
          <ChartCoinGecko />
        </div>
      </section>
    </main>
  );
}
