'use client';
import Link from 'next/link';
import { WalletConnect } from './Wallet/WalletConnect';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/useAuth';

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const isHome = pathname === '/' || pathname === undefined;
  const isProfile = pathname?.startsWith('/profile');
  const isWallet = pathname?.startsWith('/wallet');
  const isStatus = pathname?.startsWith('/status');
  const isExplorer = pathname?.startsWith('/explorer');
  const isChart = pathname?.startsWith('/chart');
  const isMempool = pathname?.startsWith('/mempool');
  const isHelp = pathname?.startsWith('/help');

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
                href="/status"
                className={navLinkClass(!!isStatus)}
                aria-current={isStatus ? 'page' : undefined}
              >
                Status
              </Link>
              <Link
                href="/wallet"
                className={navLinkClass(isWallet)}
                aria-current={isWallet ? 'page' : undefined}
              >
                Wallet
              </Link>
              <Link
                href="/explorer"
                className={navLinkClass(!!isExplorer)}
                aria-current={isExplorer ? 'page' : undefined}
              >
                Explorer
              </Link>
              <Link
                href="/mempool"
                className={navLinkClass(!!isMempool)}
                aria-current={isMempool ? 'page' : undefined}
              >
                Mempool
              </Link>
              <Link
                href="/help"
                className={navLinkClass(!!isHelp)}
                aria-current={isHelp ? 'page' : undefined}
              >
                Help
              </Link>
              <Link
                href="/chart"
                className={navLinkClass(!!isChart)}
                aria-current={isChart ? 'page' : undefined}
              >
                Chart
              </Link>
              <Link
                href="/profile"
                className={navLinkClass(!!isProfile)}
                aria-current={isProfile ? 'page' : undefined}
              >
                Profile
              </Link>
            </div>

            <div className="flex items-center gap-4 max-md:hidden">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                {loading ? (
                  <span className="text-xs text-gray-400">Auth loading...</span>
                ) : user ? (
                  <>
                    <Link
                      href="/profile"
                      className="rounded px-2 py-1 text-sm text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {user.email ?? 'Signed in'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void logout()}
                      className="rounded border border-white/10 px-2 py-1 text-xs text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="rounded border border-white/10 px-2 py-1 text-xs text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
              {isWallet && <WalletConnect />}
              {/* <ThemeSelector /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
