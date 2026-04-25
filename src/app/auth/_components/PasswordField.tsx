'use client';

import { useId, useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type PasswordFieldProps = {
  id?: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
};

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M3 3l18 18" strokeLinecap="round" />
        <path
          d="M10.58 10.58a2 2 0 102.83 2.83"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.88 5.09A10.94 10.94 0 0112 4.91c5.05 0 8.27 3.11 9.67 5.59a2.94 2.94 0 010 2.99 13.16 13.16 0 01-4.02 4.41"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.61 6.61A13.18 13.18 0 002.33 10.5a2.94 2.94 0 000 2.99c1.4 2.48 4.62 5.59 9.67 5.59 1.56 0 2.98-.3 4.26-.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M2.33 12.5a2.94 2.94 0 010-2.99C3.73 7.03 6.95 3.92 12 3.92s8.27 3.11 9.67 5.59a2.94 2.94 0 010 2.99C20.27 14.97 17.05 18.08 12 18.08S3.73 14.97 2.33 12.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PasswordField({
  id,
  label,
  registration,
  error,
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          {...registration}
          className="core-input w-full rounded-xl p-2 pr-11 text-white focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-gray-300 transition-colors hover:text-white focus:outline-none"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
