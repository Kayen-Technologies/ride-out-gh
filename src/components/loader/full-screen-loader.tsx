import Image from "next/image";

import { RideOutCar } from "./ride-out-car";

const services = ["buy a car", "rent a car", "sell your car", "import a car"];

/**
 * Full-screen route loader: the car swaps body type every 2s while the pill flips
 * through Ride Out's four services, over a parallax drive past Ghanaian city signs.
 * Pure CSS, so it renders as a Server Component (used by app/loading.tsx).
 */
export function FullScreenLoader() {
  return (
    <div
      data-ro-loader
      role="status"
      aria-live="polite"
      aria-label="Loading Ride Out"
      className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden bg-background px-4 pt-6 text-foreground md:px-12 md:pt-8"
    >
      <div className="flex w-full items-center justify-center md:justify-between">
        <Image
          src="/brand/logo-header@2x.png"
          alt="Ride Out, more than cars"
          width={105}
          height={48}
          unoptimized
          priority
          className="block h-12 w-[105px]"
        />
        <div className="hidden items-center gap-2.5 rounded-full border border-border px-4 py-2.5 font-mono text-[13px] text-text-70 md:flex">
          <span className="ro-ping block size-2 rounded-full bg-primary" />
          <span>Accra, GH</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center pb-16">
        <RoadScene />

        <div className="relative mt-5 flex flex-col items-center gap-4 md:mt-2 md:gap-[18px]">
          <h1 className="m-0 flex items-end text-5xl leading-none font-black tracking-[-0.045em] md:text-7xl">
            Pulling up
            <span className="mb-[7px] ml-1 inline-flex gap-[3px] md:mb-2.5 md:ml-1.5 md:gap-1" aria-hidden>
              <span className="ro-dot block size-[7px] rounded-full bg-primary md:size-2.5" />
              <span className="ro-dot block size-[7px] rounded-full bg-primary md:size-2.5" />
              <span className="ro-dot block size-[7px] rounded-full bg-primary md:size-2.5" />
            </span>
          </h1>
          <span
            aria-hidden
            className="ro-sticker absolute -top-9 -right-4 rounded-full bg-white px-3 py-1 text-[15px] font-black tracking-[-0.02em] text-black shadow-[0_5px_0_var(--primary)] md:-top-7 md:-right-24 md:px-3.5 md:py-1.5 md:text-lg md:shadow-[0_6px_0_var(--primary)]"
          >
            skrrt.
          </span>

          <LoaderServiceWords />

          <div className="mt-1 h-1.5 w-[200px] overflow-hidden rounded-full bg-white/10 md:mt-1.5 md:w-[280px]">
            <div className="ro-indeterminate h-full w-[30%] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** "loading the lot to [buy a car]": the pill flips in step with the car swap. */
function LoaderServiceWords() {
  return (
    <div className="flex flex-col items-center gap-3 md:flex-row">
      <span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase md:text-sm">
        loading the lot to
      </span>
      <span
        aria-hidden
        className="block h-(--ro-word-h) w-[168px] overflow-hidden rounded-full bg-primary text-primary-foreground [--ro-word-h:40px] md:w-[176px] md:[--ro-word-h:44px]"
      >
        <span className="ro-words flex flex-col text-center text-lg font-extrabold tracking-[-0.02em] md:text-xl">
          {[...services, services[0]].map((word, index) => (
            <span key={index} className="h-(--ro-word-h) leading-(--ro-word-h)">
              {word}
            </span>
          ))}
        </span>
      </span>
    </div>
  );
}

const signs = [
  { x: 100, label: "ACCRA", width: 42 },
  { x: 300, label: "KUMASI", width: 48 },
  { x: 700, label: "TAMALE", width: 46 },
];

/** Skyline, road signs and road scroll at different speeds behind the car. */
function RoadScene() {
  return (
    <svg
      viewBox="-160 0 520 100"
      aria-hidden
      className="block h-auto w-[170vw] max-w-[1100px] shrink-0"
    >
      <defs>
        <linearGradient id="ro-fade-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="ro-fade">
          <rect x="-160" y="-10" width="520" height="120" fill="url(#ro-fade-gradient)" />
        </mask>
        <g id="ro-city">
          <rect x="4" y="58" width="22" height="32" rx="1.5" fill="#1a1a1a" />
          <rect x="30" y="40" width="16" height="50" rx="1.5" fill="#1f1f1f" />
          <rect x="50" y="62" width="26" height="28" rx="1.5" fill="#1a1a1a" />
          <rect x="82" y="50" width="14" height="40" rx="1.5" fill="#1f1f1f" />
          <rect x="100" y="44" width="20" height="46" rx="1.5" fill="#1a1a1a" />
          <rect x="124" y="60" width="30" height="30" rx="1.5" fill="#1f1f1f" />
          <rect x="158" y="34" width="18" height="56" rx="1.5" fill="#1a1a1a" />
          <rect x="180" y="64" width="16" height="26" rx="1.5" fill="#1f1f1f" />
          <rect x="34" y="46" width="3" height="3" className="fill-primary" opacity="0.35" />
          <rect x="112" y="62" width="3" height="3" className="fill-primary" opacity="0.35" />
          <rect x="162" y="42" width="3" height="3" className="fill-primary" opacity="0.35" />
        </g>
        <g id="ro-signs" fontFamily="var(--font-inter), sans-serif" fontWeight="800" textAnchor="middle">
          {signs.map((sign) => (
            <g key={sign.label}>
              <path d={`M${sign.x} 90 V54`} stroke="#3a3a3a" strokeWidth="1.6" />
              <rect
                x={sign.x - sign.width / 2}
                y="40"
                width={sign.width}
                height="14"
                rx="2.5"
                className="fill-primary"
              />
              <text x={sign.x} y="49.6" fontSize="7" fill="#111111">
                {sign.label}
              </text>
            </g>
          ))}
          <path d="M500 90 V64" stroke="#3a3a3a" strokeWidth="1.6" />
          <circle cx="500" cy="54" r="9.5" fill="#ffffff" className="stroke-destructive" strokeWidth="2.4" />
          <text x="500" y="57" fontSize="8.5" fill="#111111">
            50
          </text>
        </g>
      </defs>
      <g mask="url(#ro-fade)">
        <g className="ro-sky">
          {[-200, 0, 200, 400].map((x) => (
            <use key={x} href="#ro-city" x={x} />
          ))}
        </g>
        <g className="ro-signs">
          {[-800, 0, 800].map((x) => (
            <use key={x} href="#ro-signs" x={x} />
          ))}
        </g>
        <path d="M-160 90 H360" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M-160 96 H360"
          className="ro-dash stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <g className="ro-whoosh stroke-primary" strokeWidth="2.5" strokeLinecap="round">
          <line x1="-6" y1="44" x2="12" y2="44" />
          <line x1="-16" y1="56" x2="4" y2="56" />
          <line x1="-4" y1="68" x2="10" y2="68" />
        </g>
        <circle className="ro-puff" cx="20" cy="84" r="3" fill="#4b4b4b" />
        <circle className="ro-puff" cx="20" cy="84" r="3" fill="#4b4b4b" />
        <RideOutCar swap />
      </g>
    </svg>
  );
}
