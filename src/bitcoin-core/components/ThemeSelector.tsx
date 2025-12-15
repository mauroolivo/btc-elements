'use client';

import IconThemeDark from "@/bitcoin-core/components/IconThemeDark";
import IconThemeLight from "@/bitcoin-core/components/IconThemeLight";

function ThemeSelector() {
  return (
    <>
      <button
        type="button"
        aria-label="Use Light Mode"
        className="hidden dark:flex hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-95"
        onClick={() => {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.theme = 'light';
        }}
      >
        <IconThemeLight />
      </button>
      <button
        type="button"
        aria-label="Use Dark Mode"
        className="dark:hidden hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-95"
        onClick={() => {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.theme = 'dark';
        }}
      >
        <IconThemeDark />
      </button>

      {/* <button
                className="border-primary hover:bg-primary hover:text-bgmain rounded border px-4 py-2 transition"
                onClick={() => {
                  // Check system preference
                  const prefersDark = window.matchMedia(
                    '(prefers-color-scheme: dark)'
                  ).matches;
                  localStorage.removeItem('theme');
                  // Set data-theme based on system preference
                  if (prefersDark) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.setAttribute(
                      'data-theme',
                      'light'
                    );
                  }
                }}
              >
                System Theme
              </button> */}
    </>
  );
}

export default ThemeSelector;
