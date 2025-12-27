'use client';
import Link from 'next/link';
import { WalletConnect } from './Wallet/WalletConnect';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const isWallet = pathname?.startsWith('/wallet');
  const isHome = pathname === '/' || pathname === undefined;

  function navLinkClass(active: boolean) {
    const base =
      'text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded px-2 py-1 flex items-center gap-2';
    return active ? `${base} text-white bg-white/10` : base;
  }
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-10 border-b border-black/5 dark:border-white/10">
        <div className="bg-white/10 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-8 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className={navLinkClass(isHome)}
                aria-current={isHome ? 'page' : undefined}
              >
                Home
              </Link>
              <Link
                href="/wallet"
                className={navLinkClass(isWallet)}
                aria-current={isWallet ? 'page' : undefined}
              >
                Wallet
              </Link>
            </div>

            <div className="flex items-center gap-6 max-md:hidden">
              {isWallet && <WalletConnect />}
              {/* <ThemeSelector /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
