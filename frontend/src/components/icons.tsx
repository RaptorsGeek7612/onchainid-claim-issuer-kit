import { useId } from "react";

type IconProps = { size?: number };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function DocumentIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function SignatureIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path className="icon-signature-path" d="M4 19c2-3 3-6 4-9 1 3 2 6 4 9 1-2 2-4 3-4s1 2 3 2" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function ShieldCheckIcon({ size = 20 }: IconProps) {
  const clipId = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <defs>
        <clipPath id={clipId}>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
        </clipPath>
      </defs>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <g clipPath={`url(#${clipId})`}>
        <rect className="icon-scan-line" x="3" y="2" width="18" height="2.4" fill="currentColor" opacity="0.5" />
      </g>
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function LinkIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M9 15l6-6" />
      <path d="M11 5.5l1-1a3.5 3.5 0 0 1 5 5l-1 1" />
      <path d="M13 18.5l-1 1a3.5 3.5 0 0 1-5-5l1-1" />
    </svg>
  );
}
