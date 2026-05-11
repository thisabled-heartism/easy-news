export function Logo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden="true">
      <path
        d="M15 26 L4 14 C0 10 2 4 7 4 C10 4 12 6 15 9 C18 6 20 4 23 4 C28 4 30 10 26 14 Z"
        fill="#7c3aed"
      />
      <circle cx="22" cy="9" r="3" fill="#fbbf24" />
    </svg>
  );
}
