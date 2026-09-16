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
      {/* calibration ring, with ticks at the three active angles */}
      <circle className="brand-ring" cx="20" cy="20" r="18.5" stroke="#c9a227" strokeWidth="1" opacity="0.7" />
      <g stroke="#c9a227" strokeWidth="0.8" opacity="0.6">
        <line x1="20" y1="2.7" x2="20" y2="0.3" />
        <line x1="34.98" y1="28.65" x2="37.06" y2="29.85" />
        <line x1="5.02" y1="28.65" x2="2.94" y2="29.85" />
      </g>

      {/* outer hexagon: the network */}
      <polygon
        points="20,3.5 34.29,11.75 34.29,28.25 20,36.5 5.71,28.25 5.71,11.75"
        fill="#16234d"
        stroke="#c9a227"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* three claim spokes: issue, verify, revoke — 120° apart, linking every scale */}
      <g stroke="#c9a227" strokeWidth="1" opacity="0.85">
        <line x1="20" y1="9" x2="20" y2="3.5" />
        <line x1="29.53" y1="25.5" x2="34.29" y2="28.25" />
        <line x1="10.47" y1="25.5" x2="5.71" y2="28.25" />
      </g>

      {/* middle hexagon: self-similar, hollow */}
      <polygon
        points="20,9 29.53,14.5 29.53,25.5 20,31 10.47,25.5 10.47,14.5"
        stroke="#c9a227"
        strokeWidth="1"
        fill="none"
      />

      {/* node reticles at the three active vertices */}
      <g fill="#16234d" stroke="#c9a227" strokeWidth="0.9">
        <circle cx="20" cy="3.5" r="2.2" />
        <circle cx="34.29" cy="28.25" r="2.2" />
        <circle cx="5.71" cy="28.25" r="2.2" />
      </g>
      <g fill="#c9a227">
        <circle cx="20" cy="3.5" r="0.85" />
        <circle cx="34.29" cy="28.25" r="0.85" />
        <circle cx="5.71" cy="28.25" r="0.85" />
      </g>

      {/* the issuer: innermost self-similar hexagon, solid */}
      <polygon points="20,14 25.2,17 25.2,23 20,26 14.8,23 14.8,17" fill="#c9a227" />
    </svg>
  );
}
