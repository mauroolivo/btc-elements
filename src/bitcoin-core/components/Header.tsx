'use client';
import Link from 'next/link';
import ThemeSelector from '@/bitcoin-core/components/ThemeSelector';
import { WalletConnect } from './WalletConnect';

export function Header() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-10 border-b border-black/5 dark:border-white/10">
        <div className="bg-white/10 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-8 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-text flex items-center gap-2">
                home
              </Link>
            </div>

            <div className="flex items-center gap-6 max-md:hidden">

              <WalletConnect />
              
              <Link href="/layouts" className="text-text text-sm/6">
                layouts
              </Link>
              <Link href="/layouts2" className="text-text text-sm/6">
                layouts2
              </Link>
              <Link href="/layouts3" className="text-text text-sm/6">
                layouts3
              </Link>
              <Link href="/menus" className="text-text text-sm/6">
                menus
              </Link>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
