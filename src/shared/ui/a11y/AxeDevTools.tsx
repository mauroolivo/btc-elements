'use client';

import { useEffect } from 'react';

const AXE_RUN_DELAY_MS = 1000;

export function AxeDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    let isUnmounted = false;

    const runAxe = async () => {
      try {
        const reactModule = await import('react');
        const reactDomModule = await import('react-dom');
        const axe = (await import('@axe-core/react')).default;

        const React = reactModule.default ?? reactModule;
        const ReactDOM = reactDomModule.default ?? reactDomModule;

        if (!isUnmounted) {
          // Some third-party auth flows can create transient documents/iframes
          // that report missing titles even when app pages are titled correctly.
          void axe(React, ReactDOM, AXE_RUN_DELAY_MS, {
            rules: [{ id: 'document-title', enabled: false }],
          });
        }
      } catch (error) {
        // Keep axe failures non-blocking in development.
        console.error('Failed to initialize @axe-core/react', error);
      }
    };

    void runAxe();

    return () => {
      isUnmounted = true;
    };
  }, []);

  return null;
}
