import Link from 'next/link';

export default function Page() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl items-center px-6 pt-24 pb-8">
      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-semibold text-white">Home</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          This page is now a placeholder. The node overview that used to live
          here has been moved to the status route.
        </p>
        <Link
          href="/status"
          className="mt-6 inline-flex rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          Open status
        </Link>
      </div>
    </div>
  );
}
