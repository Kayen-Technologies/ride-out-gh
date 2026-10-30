import Image from "next/image";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <header className="flex justify-center bg-black px-4 py-6">
        <Link href="/" aria-label="Ride Out" className="relative block h-12 w-[105px] overflow-hidden">
          <Image
            src="/brand/logo.png"
            alt=""
            width={1042}
            height={1043}
            className="absolute top-[-127.73%] left-[-33.61%] h-[352.42%] w-[161.22%] max-w-none"
          />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-[358px] flex-1 flex-col justify-center px-4 py-8">{children}</main>
      <div className="pointer-events-none flex h-[75px] justify-center overflow-hidden" aria-hidden="true">
        <div className="relative h-[75px] w-[288px]">
          <Image
            src="/brand/tyre.png"
            alt=""
            width={1275}
            height={1234}
            className="absolute top-[-3.43%] left-[-71.25%] h-[121.77%] w-[485.28%] max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
