type ClaimStatus = "valid" | "issuing" | "revoked";
type Badge = { id: string; angle: number; radius: number; status: ClaimStatus };
type Star = { x: number; y: number; r: number; delay: number };

const SIZE = 600;
const CENTER = { x: SIZE / 2, y: SIZE / 2 };
const HUB_R = 34;

// Deterministic PRNG (mulberry32) — same output on server and client, so no
// hydration mismatch from a "random" background.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sixteen claims radiating from the issuer's seal: a strong majority valid,
// one being signed right now, only one revoked — the three actions this app
// performs, kept mostly positive on purpose.
const BADGES: Badge[] = [
  { id: "b0", angle: -170, radius: 180, status: "valid" },
  { id: "b1", angle: -148, radius: 165, status: "valid" },
  { id: "b2", angle: -124, radius: 195, status: "valid" },
  { id: "b3", angle: -100, radius: 170, status: "issuing" },
  { id: "b4", angle: -78, radius: 190, status: "valid" },
  { id: "b5", angle: -56, radius: 175, status: "valid" },
  { id: "b6", angle: -34, radius: 200, status: "valid" },
  { id: "b7", angle: -12, radius: 178, status: "valid" },
  { id: "b8", angle: 20, radius: 185, status: "revoked" },
  { id: "b9", angle: 40, radius: 168, status: "valid" },
  { id: "b10", angle: 60, radius: 192, status: "valid" },
  { id: "b11", angle: 80, radius: 173, status: "valid" },
  { id: "b12", angle: 100, radius: 188, status: "valid" },
  { id: "b13", angle: 122, radius: 177, status: "valid" },
  { id: "b14", angle: 144, radius: 197, status: "valid" },
  { id: "b15", angle: 164, radius: 171, status: "valid" },
];

// Identity holders, each attached to one of their valid claims.
const IDENTITIES: { badgeId: string; offsetAngle: number; distance: number }[] = [
  { badgeId: "b0", offsetAngle: -10, distance: 58 },
  { badgeId: "b4", offsetAngle: 12, distance: 60 },
  { badgeId: "b6", offsetAngle: -8, distance: 62 },
  { badgeId: "b9", offsetAngle: 14, distance: 58 },
  { badgeId: "b11", offsetAngle: -12, distance: 60 },
  { badgeId: "b13", offsetAngle: 10, distance: 58 },
  { badgeId: "b15", offsetAngle: -14, distance: 62 },
];

function point(angleDeg: number, radius: number, from = CENTER) {
  const rad = (angleDeg * Math.PI) / 180;
  // Rounded to 2 decimals: Math.cos/Math.sin can differ in the last bit
  // between server (Node) and client (browser) engines, which otherwise
  // causes a React hydration mismatch on these SVG coordinates.
  return {
    x: Math.round((from.x + Math.cos(rad) * radius) * 100) / 100,
    y: Math.round((from.y + Math.sin(rad) * radius) * 100) / 100,
  };
}

function buildStars(): Star[] {
  const rand = mulberry32(2024);
  const stars: Star[] = [];
  for (let i = 0; i < 9; i++) {
    const angle = rand() * 360;
    const radius = 260 + rand() * 260;
    const p = point(angle, radius);
    if (p.x < -20 || p.x > SIZE + 20 || p.y < -20 || p.y > SIZE + 20) continue;
    stars.push({ x: p.x, y: p.y, r: 0.6 + rand() * 0.7, delay: rand() * 4 });
  }
  return stars;
}

const STARS = buildStars();

function BadgeIcon({ status, x, y }: { status: ClaimStatus; x: number; y: number }) {
  if (status === "revoked") {
    return (
      <g stroke="var(--danger)" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <line x1={x - 3.2} y1={y - 3.2} x2={x + 3.2} y2={y + 3.2} />
        <line x1={x - 3.2} y1={y + 3.2} x2={x + 3.2} y2={y - 3.2} />
      </g>
    );
  }
  if (status === "issuing") {
    return (
      <path
        d={`M${x - 5},${y + 3} l2.5,-6.5 l2.5,6.5 l2.5,-6.5`}
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  }
  return (
    <path
      d={`M${x - 4.2},${y} l2.6,3 l5.2,-6.4`}
      stroke="#ffffff"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

export function NetworkGraphic() {
  return (
    <svg
      className="network-graphic"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="network-line" x1="0" y1="0" x2={SIZE} y2={SIZE} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5c85dd" />
          <stop offset="35%" stopColor="#3a5fb8" />
          <stop offset="70%" stopColor="#274a99" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
        <radialGradient id="network-particle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* faint background stars */}
      <g fill="#ffffff">
        {STARS.map((s, i) => (
          <circle key={`star-${i}`} cx={s.x} cy={s.y} r={s.r} className="network-star" style={{ animationDelay: `${s.delay}s` }} />
        ))}
      </g>

      {/* traveling pulses on the active claims */}
      {BADGES.filter((b) => b.status !== "revoked").map((b, i) => {
        const from = point(b.angle, HUB_R + 4);
        const to = point(b.angle, b.radius);
        return (
          <circle key={`pulse-${b.id}`} r="3" fill="url(#network-particle)" className="network-particle">
            <animateMotion
              dur={`${2.6 + (i % 3) * 0.5}s`}
              begin={`${-i * 0.6}s`}
              repeatCount="indefinite"
              path={`M${from.x},${from.y} L${to.x},${to.y}`}
            />
          </circle>
        );
      })}

      {/* identity holders */}
      <g>
        {IDENTITIES.map((identity, i) => {
          const badge = BADGES.find((b) => b.id === identity.badgeId)!;
          const idP = point(badge.angle + identity.offsetAngle, badge.radius + identity.distance);
          return (
            <circle
              key={`id-dot-${i}`}
              cx={idP.x}
              cy={idP.y}
              r="4.5"
              fill="none"
              stroke="url(#network-line)"
              strokeWidth="1.4"
              className="network-node"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          );
        })}
      </g>

      {/* claim badges */}
      {BADGES.map((b) => {
        const p = point(b.angle, b.radius);
        const revoked = b.status === "revoked";
        return (
          <g key={b.id} opacity={revoked ? 0.55 : 1}>
            <rect
              x={p.x - 12}
              y={p.y - 9}
              width="24"
              height="18"
              rx="5"
              stroke={revoked ? "var(--border-strong)" : "url(#network-line)"}
              strokeWidth="1.3"
              fill="var(--bg-elevated)"
              className={revoked ? undefined : "network-node"}
              style={revoked ? undefined : { animationDelay: `${b.angle % 3}s`, transformBox: "fill-box", transformOrigin: "center" }}
            />
            <BadgeIcon status={b.status} x={p.x} y={p.y} />
          </g>
        );
      })}

      {/* the issuer's seal, at the center */}
      <g>
        <polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const hp = point(i * 60 - 90, HUB_R);
            return `${hp.x},${hp.y}`;
          }).join(" ")}
          stroke="url(#network-line)"
          strokeWidth="1.6"
          fill="var(--bg-elevated)"
          className="network-node-hub"
        />
        <path
          d={`M${CENTER.x - 11},${CENTER.y + 1} l7,8 l14,-17`}
          stroke="url(#network-line)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
