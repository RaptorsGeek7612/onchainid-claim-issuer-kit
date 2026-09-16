export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Marque Claim Issuer Kit"
    >
      <defs>
        <linearGradient id="brand-gradient" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5B8CFF" />
          <stop offset="55%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18.5" fill="url(#brand-gradient)" opacity="0.16" />
      <circle cx="20" cy="20" r="18.5" stroke="url(#brand-gradient)" strokeWidth="1.6" />
      <path
        d="M14 24.5V17a6 6 0 0 1 12 0v7.5"
        stroke="url(#brand-gradient)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="26.5" r="2.1" fill="url(#brand-gradient)" />
      <circle cx="26" cy="26.5" r="2.1" fill="url(#brand-gradient)" />
      <circle cx="20" cy="12.5" r="2.1" fill="url(#brand-gradient)" />
    </svg>
  );
}
