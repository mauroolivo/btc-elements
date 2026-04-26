type AuthGoogleButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label: string;
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M21.81 12.23c0-.72-.06-1.25-.2-1.8H12.2v3.4h5.52c-.11.84-.71 2.1-2.05 2.95l-.02.11 3 2.27.2.02c1.82-1.64 2.86-4.04 2.86-6.95Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 21.9c2.7 0 4.97-.87 6.63-2.36l-3.17-2.4c-.84.57-1.97.97-3.46.97-2.64 0-4.88-1.72-5.69-4.1l-.1.01-3.12 2.36-.03.09c1.65 3.21 5.04 5.43 8.94 5.43Z"
        fill="#34A853"
      />
      <path
        d="M6.51 14.01A5.82 5.82 0 0 1 6.18 12c0-.7.12-1.37.32-2.01l-.01-.13-3.16-2.4-.1.04A9.66 9.66 0 0 0 2.2 12c0 1.57.38 3.06 1.04 4.37l3.27-2.36Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 5.89c1.88 0 3.15.79 3.87 1.45l2.82-2.68C17.16 3.1 14.9 2.1 12.2 2.1c-3.9 0-7.29 2.22-8.94 5.43l3.27 2.4c.82-2.38 3.05-4.04 5.67-4.04Z"
        fill="#EB4335"
      />
    </svg>
  );
}

export function AuthGoogleButton({
  onClick,
  disabled,
  label,
}: AuthGoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="core-button-secondary"
    >
      <GoogleIcon />
      <span className="ml-2">{label}</span>
    </button>
  );
}
