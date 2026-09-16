const NODES = [
  { id: "a", x: 40, y: 60 },
  { id: "b", x: 160, y: 30 },
  { id: "c", x: 260, y: 90 },
  { id: "d", x: 100, y: 160 },
  { id: "e", x: 230, y: 200 },
  { id: "f", x: 330, y: 150 },
  { id: "g", x: 60, y: 260 },
  { id: "h", x: 190, y: 300 },
] as const;

const EDGES: [string, string][] = [
  ["a", "b"],
  ["b", "c"],
  ["b", "d"],
  ["d", "a"],
  ["d", "e"],
  ["c", "f"],
  ["e", "f"],
  ["d", "g"],
  ["e", "h"],
  ["g", "h"],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function NetworkGraphic() {
  return (
    <svg
      className="network-graphic"
      viewBox="0 0 380 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="network-line" x1="0" y1="0" x2="380" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b8cff" />
          <stop offset="55%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <g stroke="url(#network-line)" strokeWidth="1" opacity="0.5">
        {EDGES.map(([from, to], i) => {
          const a = nodeById(from);
          const b = nodeById(to);
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className="network-edge"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          );
        })}
      </g>
      <g>
        {NODES.map((n, i) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={i % 3 === 0 ? 5 : 3.4}
            fill="url(#network-line)"
            className="network-node"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
