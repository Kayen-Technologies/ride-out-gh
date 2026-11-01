"use client";

import Image from "next/image";
import { toast } from "sonner";

import { signInWithGoogle } from "@/features/auth/actions";

export function GoogleButton({ label }: { label: string }) {
  async function onSubmit() {
    const result = await signInWithGoogle();
    if (result?.error) toast.error(result.error);
  }

  return (
    <form action={onSubmit}>
      <button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-neutral-500 bg-white px-3 text-sm text-[#0a090b] shadow-soft"
      >
        <Image src="/brand/google.svg" alt="" width={20} height={20} />
        {label}
      </button>
    </form>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-sm text-foreground">
      <span className="h-px flex-1 bg-white" />
      or
      <span className="h-px flex-1 bg-white" />
    </div>
  );
}
