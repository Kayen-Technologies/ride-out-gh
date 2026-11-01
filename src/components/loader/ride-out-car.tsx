import { cn } from "cn";

// Body shapes share one 200×100 frame: wheels at x 56 / 146, road at y 90.
const bodies: {
  shell: string;
  glass: string;
  /** Open strokes such as a bike's fork and swingarm. */
  frame?: string;
  headlight: { x: number; y: number };
  taillight: { x: number; y: number };
}[] = [
  {
    // Sedan
    shell: "M20 72 L20 60 L34 55 L62 51 L80 37 L122 37 L142 51 L168 54 L180 60 L180 72 L120 72 L80 72 Z",
    glass: "M74 51 L85 41 L118 41 L133 51 Z",
    headlight: { x: 173, y: 57 },
    taillight: { x: 20, y: 60 },
  },
  {
    // Motorbike with rider
    shell:
      "M34 58 L48 52 L72 54 L90 50 L102 42 L122 40 L136 48 L138 58 L116 62 L98 66 L72 66 L56 62 Z M70 54 L78 30 L92 26 L104 38 L96 42 L88 34 L86 52 Z M81 18 A9 9 0 1 1 99 18 A9 9 0 1 1 81 18 Z",
    glass: "M50 55 L72 56 L70 60 L52 60 Z M92 14 L100 14 L100 20 L93 20 Z",
    frame: "M132 50 L146 78 M92 64 L56 78 M124 42 L118 30 M98 36 L118 32",
    headlight: { x: 131, y: 50 },
    taillight: { x: 34, y: 56 },
  },
  {
    // SUV
    shell: "M20 72 L20 46 L26 36 L48 33 L60 26 L144 26 L160 40 L176 44 L180 52 L180 72 L120 72 L80 72 Z",
    glass: "M56 40 L66 31 L138 31 L150 40 Z",
    headlight: { x: 173, y: 48 },
    taillight: { x: 20, y: 48 },
  },
  {
    // Bus
    shell: "M8 72 L8 28 Q8 22 14 22 L178 22 Q190 22 192 34 L192 72 Z",
    glass:
      "M18 30 H44 V46 H18 Z M52 30 H78 V46 H52 Z M86 30 H112 V46 H86 Z M120 30 H146 V46 H120 Z M156 30 H180 Q186 30 186 38 V54 H156 Z",
    headlight: { x: 183, y: 60 },
    taillight: { x: 8, y: 60 },
  },
  {
    // Pickup
    shell: "M18 72 L18 50 L96 50 L98 30 L130 30 L146 48 L170 50 L180 57 L180 72 L120 72 L80 72 L18 72 Z",
    glass: "M103 46 L104 35 L126 35 L137 46 Z",
    headlight: { x: 173, y: 56 },
    taillight: { x: 18, y: 52 },
  },
  {
    // Truck
    shell: "M10 72 L10 18 L124 18 L124 34 L150 34 L166 46 L184 50 L186 60 L186 72 Z",
    glass: "M123 20 H127 V70 H123 Z M132 38 L148 38 L160 48 L132 48 Z",
    headlight: { x: 178, y: 54 },
    taillight: { x: 10, y: 56 },
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
 * `swap` cycles sedan → motorbike → SUV → bus → pickup → truck → hatchback, one every 2s
 * (each swap lands on a LoaderServiceWords flip); otherwise it stays a sedan.
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
            {body.frame ? (
              <path
                d={body.frame}
                fill="none"
                className="stroke-primary"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ) : null}
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
