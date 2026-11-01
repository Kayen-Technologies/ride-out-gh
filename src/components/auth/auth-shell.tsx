import Image from "next/image";
import Link from "next/link";

import { cn } from "cn";

// Transparent logo.png, cropped to 105 x 48. The header export (logo-header.png) has an opaque black
// background, which shows as a box on the #111 login page.
function AuthLogo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Ride Out" className={className}>
      <span className="relative block h-12 w-[105px] overflow-hidden">
        <Image
          src="/brand/logo.png"
          alt=""
          width={1042}
          height={1043}
          className="absolute top-[-127.73%] left-[-33.61%] h-[352.42%] w-[161.22%] max-w-none"
        />
      </span>
    </Link>
  );
}

export function AuthShell({
  children,
  hero,
  mobileAlign = "center",
  mobileTopOffset = 64,
}: {
  children: React.ReactNode;
  hero?: React.ReactNode;
  /** Mobile only. "top": starts 64px under the header (login, Figma 120:9900). "center": centred in the frame (forgot password, Figma 120:10589). */
  mobileAlign?: "top" | "center";
  /** Mobile "top" only: px between the header and the content (login 64, sign up 62). */
  mobileTopOffset?: number;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-screen w-full max-w-[var(--container-max)] flex-1 flex-col bg-background lg:min-h-screen",
        // Figma 120:9731: 56 margin, two 652 columns, 24 gap (at 1440).
        hero && "lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-hidden lg:p-14",
      )}
    >
      <header className="relative z-10 flex shrink-0 justify-center bg-black px-4 py-6 lg:hidden">
        <AuthLogo />
      </header>

      <AuthLogo className="absolute top-8 left-8 z-20 hidden lg:block" />

      <main
        style={{ "--auth-top": `${mobileTopOffset}px` } as React.CSSProperties}
        className={cn(
          "absolute inset-x-0 z-[1] flex justify-center px-4 lg:relative lg:top-auto lg:bottom-auto lg:flex lg:min-h-0 lg:flex-1 lg:items-center lg:justify-center lg:px-0 lg:py-0",
          mobileAlign === "top" ? "top-24 bottom-[75px] items-start pt-[var(--auth-top)]" : "inset-y-0 items-center py-24",
          hero && "lg:col-start-1 lg:self-stretch",
        )}
      >
        <div className="w-full max-w-[358px] lg:max-w-[400px]">{children}</div>
      </main>

      {hero ? (
        <aside className="relative hidden min-h-0 items-end justify-center self-stretch lg:flex">
          {hero}
        </aside>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex h-[75px] justify-center overflow-hidden lg:hidden"
        aria-hidden="true"
      >
        <div className="relative h-[75px] w-[288px]">
          {/* Figma 120:9920: 75 x 288 crop of the image, transposed (rotated and flipped) into 288 x 75. */}
          <div className="absolute top-0 left-0 h-[288px] w-[75px] origin-top-left overflow-hidden [transform:matrix(0,1,1,0,0,0)]">
            <Image
              src="/brand/tyre.png"
              alt=""
              width={1275}
              height={1234}
              sizes="364px"
              className="absolute top-[-9.9px] left-[-53.4px] h-[350.7px] w-[363.9px] max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
