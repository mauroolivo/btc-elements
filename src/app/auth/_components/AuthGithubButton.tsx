type AuthGithubButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label: string;
};

function GithubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.42-4.04-1.42a3.18 3.18 0 0 0-1.33-1.75c-1.09-.74.08-.72.08-.72a2.52 2.52 0 0 1 1.84 1.23 2.56 2.56 0 0 0 3.5 1 2.56 2.56 0 0 1 .76-1.61c-2.66-.3-5.47-1.33-5.47-5.92a4.62 4.62 0 0 1 1.23-3.2 4.3 4.3 0 0 1 .12-3.16s1-.32 3.3 1.22a11.37 11.37 0 0 1 6 0c2.3-1.54 3.3-1.22 3.3-1.22a4.3 4.3 0 0 1 .12 3.16 4.61 4.61 0 0 1 1.23 3.2c0 4.6-2.82 5.61-5.5 5.91a2.87 2.87 0 0 1 .82 2.23v3.31c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export function AuthGithubButton({
  onClick,
  disabled,
  label,
}: AuthGithubButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="core-button-secondary"
    >
      <GithubIcon />
      <span className="ml-2">{label}</span>
    </button>
  );
}
