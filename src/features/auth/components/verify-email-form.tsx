"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { resendVerification, verifyEmail } from "@/features/auth/actions";

const codeLength = 6;

export function VerifyEmailForm({ email }: { email: string }) {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: codeLength }, () => ""));
  const [pending, setPending] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function update(index: number, value: string) {
    const next = value.replace(/\D/g, "");
    const nextDigits = [...digits];
    if (next.length > 1) {
      const chars = next.slice(0, codeLength).split("");
      chars.forEach((char, offset) => {
        if (index + offset < codeLength) nextDigits[index + offset] = char;
      });
      setDigits(nextDigits);
      inputs.current[Math.min(index + chars.length, codeLength - 1)]?.focus();
      if (nextDigits.every((digit) => digit.length === 1)) void submit(nextDigits.join(""));
      return;
    }
    nextDigits[index] = next.slice(-1);
    setDigits(nextDigits);
    if (next && index < codeLength - 1) inputs.current[index + 1]?.focus();
    if (nextDigits.every((digit) => digit.length === 1)) void submit(nextDigits.join(""));
  }

  async function submit(token: string) {
    setPending(true);
    const result = await verifyEmail({ email, token });
    setPending(false);
    if (result?.error) toast.error(result.error);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(digits.join(""));
  }

  async function onResend() {
    const result = await resendVerification(email);
    if (result?.error) toast.error(result.error);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2 text-center text-white">
        <h1 className="text-2xl leading-10 font-medium">Verify your Email</h1>
        <p className="text-sm leading-[1.5] tracking-[-0.18px]">
          We’ve sent you a code on {maskEmail(email)}. Enter it below to verify your account.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col items-center gap-6">
        <div className="flex w-full gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              value={digit}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1}`}
              maxLength={codeLength}
              onChange={(event) => update(index, event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
              }}
              className="h-[60px] min-w-0 flex-1 rounded-[10px] border border-border bg-input text-center text-2xl text-foreground outline-none focus-visible:border-primary"
            />
          ))}
        </div>
        <button type="submit" className="sr-only" disabled={pending}>
          Verify
        </button>
        <p className="text-sm tracking-[-0.18px] text-white">
          Didn’t receive code?{" "}
          <button type="button" className="font-semibold text-primary" onClick={onResend}>
            Resend code
          </button>
        </p>
      </form>
    </div>
  );
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "your email";
  return `${name.slice(0, 1)}****@${domain}`;
}
