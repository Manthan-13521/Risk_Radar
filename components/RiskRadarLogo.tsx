export function RiskRadarLogo({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Hexagonal Shield Background */}
      <polygon
        points="24,2 44,12 44,36 24,46 4,36 4,12"
        fill="#990011"
        stroke="#111111"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Inner Surface */}
      <polygon
        points="24,6 40,14 40,34 24,42 8,34 8,14"
        fill="#FCF6F5"
      />

      {/* Concentric Radar Rings */}
      <circle
        cx="24"
        cy="24"
        r="14"
        stroke="#111111"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="24"
        cy="24"
        r="9.5"
        stroke="#111111"
        strokeWidth="1.8"
        fill="none"
      />
      <circle
        cx="24"
        cy="24"
        r="5"
        stroke="#990011"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Radar Center Beacon */}
      <circle
        cx="24"
        cy="24"
        r="3"
        fill="#990011"
      />

      {/* Radar Sweep Needle */}
      <path
        d="M24 24L38 10"
        stroke="#990011"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Needle Tip Arrow */}
      <circle
        cx="38"
        cy="10"
        r="1.8"
        fill="#76000D"
      />
    </svg>
  );
}
