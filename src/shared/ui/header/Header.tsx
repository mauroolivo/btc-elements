'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@features/auth';

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHome = pathname === '/' || pathname === undefined;
  const isProfile = pathname?.startsWith('/profile');
  const isMyWallets = pathname?.startsWith('/my-wallets');
  const isStatus = pathname?.startsWith('/status');
  const isExplorer = pathname?.startsWith('/explorer');
  // const isChart = pathname?.startsWith('/chart');
  const isMempool = pathname?.startsWith('/mempool');

  const navItems = [
    { href: '/', label: 'Home', active: isHome },
    { href: '/status', label: 'Node Status', active: !!isStatus },
    { href: '/explorer', label: 'Explorer', active: !!isExplorer },
    { href: '/mempool', label: 'Mempool', active: !!isMempool },
    ...(user
      ? [{ href: '/profile', label: 'Profile', active: !!isProfile }]
      : []),
    { href: '/my-wallets', label: 'My Wallets', active: !!isMyWallets },
  ];
  const currentSectionLabel =
    navItems.find((item) => item.active)?.label ?? 'Menu';

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  function navLinkClass(active: boolean) {
    const base =
      'flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors border-transparent text-gray-300 hover:border-white/8 hover:bg-white/8 hover:text-white';
    return active
      ? `${base} border-cyan-300/15 bg-cyan-400/12 text-white`
      : base;
  }
  return (
    <header className="fixed inset-x-0 top-0 z-10 border-b border-black/5 dark:border-white/10">
      <div className="bg-[linear-gradient(180deg,rgba(7,17,27,0.78),rgba(7,17,27,0.55))] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <nav
            className="hidden items-center gap-4 lg:flex"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(item.active)}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            <span className="truncate text-sm font-medium tracking-[0.18em] text-gray-200 uppercase">
              {currentSectionLabel}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-100 transition-colors hover:bg-white/10 lg:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
            aria-label={
              isMobileMenuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span className="sr-only">Toggle menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>

          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              {loading ? (
                <span className="text-xs text-gray-400">Auth loading...</span>
              ) : user ? (
                <>
                  <Link
                    href="/profile"
                    className="core-button-secondary max-w-72 truncate px-3 py-1.5 text-sm text-gray-200"
                  >
                    {user.email ?? 'Signed in'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="core-button-muted px-3 py-1.5 text-xs text-gray-200"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="core-button-primary px-3 py-1.5 text-xs"
                >
                  Authenticate
                </Link>
              )}
            </div>
            {/* <ThemeSelector /> */}
          </div>
        </div>

        {isMobileMenuOpen ? (
          <nav
            id="mobile-site-menu"
            className="border-t border-white/10 px-4 py-4 lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(item.active)}
                  aria-current={item.active ? 'page' : undefined}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4 text-sm text-gray-300">
              {loading ? (
                <span className="text-xs text-gray-400">Auth loading...</span>
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/profile"
                    className="core-button-secondary truncate px-3 py-2 text-sm text-gray-200"
                    onClick={closeMobileMenu}
                  >
                    {user.email ?? 'Signed in'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      void logout();
                    }}
                    className="core-button-muted px-3 py-2 text-xs text-gray-200"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="core-button-primary inline-flex px-3 py-2 text-xs"
                  onClick={closeMobileMenu}
                >
                  Authenticate
                </Link>
              )}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
