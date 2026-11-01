import { cn } from "cn";

// Body shapes share one 200×100 frame: wheels at x 56 / 146, road at y 90.
const bodies = [
  {
    // Sedan
    shell: "M20 72 L20 60 L34 55 L62 51 L80 37 L122 37 L142 51 L168 54 L180 60 L180 72 L120 72 L80 72 Z",
    glass: "M74 51 L85 41 L118 41 L133 51 Z",
    headlight: { x: 173, y: 57 },
    taillight: { x: 20, y: 60 },
  },
  {
    // SUV
    shell: "M20 72 L20 46 L26 36 L48 33 L60 26 L144 26 L160 40 L176 44 L180 52 L180 72 L120 72 L80 72 Z",
    glass: "M56 40 L66 31 L138 31 L150 40 Z",
    headlight: { x: 173, y: 48 },
    taillight: { x: 20, y: 48 },
  },
  {
    // Pickup
    shell: "M18 72 L18 50 L96 50 L98 30 L130 30 L146 48 L170 50 L180 57 L180 72 L120 72 L80 72 L18 72 Z",
    glass: "M103 46 L104 35 L126 35 L137 46 Z",
    headlight: { x: 173, y: 56 },
    taillight: { x: 18, y: 52 },
  },
  {
    // Hatchback
    shell: "M28 72 L28 54 L36 44 L60 40 L76 30 L132 30 L150 46 L166 50 L172 58 L172 72 L120 72 L80 72 Z",
    glass: "M72 42 L82 34 L128 34 L142 45 Z",
    headlight: { x: 165, y: 58 },
    taillight: { x: 28, y: 56 },
  },
];

/**
 * The Ride Out car, drawn into an existing <svg viewBox> that includes 0–200 × 0–100.
 * `swap` cycles sedan → SUV → pickup → hatchback every 2s (in step with LoaderServiceWords);
 * otherwise it stays a sedan.
 */
export function RideOutCar({ swap = false }: { swap?: boolean }) {
  const shown = swap ? bodies : bodies.slice(0, 1);

  return (
    <>
      <g className="ro-bob">
        {shown.map((body, index) => (
          <g key={body.shell} className={cn(swap && `ro-car ro-car-${index + 1}`)}>
            <path
              d={body.shell}
              className="fill-primary stroke-primary"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path d={body.glass} fill="#111111" opacity="0.9" />
            <rect
              className="ro-headlight"
              x={body.headlight.x}
              y={body.headlight.y}
              width="7"
              height="4"
              rx="1.5"
              fill="#ffffff"
            />
            <rect
              x={body.taillight.x}
              y={body.taillight.y}
              width="4"
              height="4"
              rx="1"
              className="fill-destructive"
            />
          </g>
        ))}
      </g>
      {[56, 146].map((x) => (
        <g key={x} transform={`translate(${x} 78)`}>
          <circle r="11" fill="#111111" className="stroke-primary" strokeWidth="3" />
          <path
            className="ro-spoke stroke-primary"
            d="M-5 0 H5 M0 -5 V5"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      ))}
    </>
  );
}
