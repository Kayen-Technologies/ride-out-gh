"use client";

import { Camera, Loader2, Plus, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useEffect, useRef, useState, useTransition } from "react";

import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { CarSwoosh } from "@/features/inventory/vehicle-form/components/result-dialog";
import { shrink } from "@/features/inventory/vehicle-form/image-utils";
import { submitRentalRequest } from "@/features/rent/request/actions";
import { requestFieldsSchema, type RequestFields } from "@/features/rent/request/schema";
import { cn } from "cn";

type Props = {
  slug: string;
  title: string;
  pickup: string;
  dropoff: string;
  place?: string;
  /** "4 days · GHS 2,600", shown under the heading so people see what they are requesting. */
  summary: string;
  className?: string;
};

type Errors = Partial<Record<keyof RequestFields | "ghanaCardImage", string>>;

const input =
  "h-11 w-full rounded-lg border border-[#595959] bg-[#333] px-3.5 text-sm text-white placeholder:text-white/50 outline-none focus-visible:ring-3 focus-visible:ring-primary/60 aria-invalid:border-[#ff6b6b]";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-base text-white">
      <span>
        {label}
        {required ? "*" : ""}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-sm text-[#ff8a8a]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

/**
 * The "Request this car" button and its form (Figma 1:4829), then the thank-you card (Figma 1:4408).
 * The Ghana Card photo is shrunk here before it is sent, so a phone photo uploads quickly.
 */
export function RequestModal({ slug, title, pickup, dropoff, place, summary, className }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => () => (photo ? URL.revokeObjectURL(photo.url) : undefined), [photo]);

  function pick(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((e) => ({ ...e, ghanaCardImage: "Use a JPG, PNG or WebP photo." }));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrors((e) => ({ ...e, ghanaCardImage: "That photo is too large. Use one under 20 MB." }));
      return;
    }
    setErrors((e) => ({ ...e, ghanaCardImage: undefined }));
    setPhoto({ file, url: URL.createObjectURL(file) });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const checked = requestFieldsSchema.safeParse(values);
    if (!checked.success) {
      const next: Errors = {};
      for (const issue of checked.error.issues) next[issue.path[0] as keyof Errors] ??= issue.message;
      setErrors(next);
      setFormError(null);
      return;
    }
    setErrors({});
    setFormError(null);
    startTransition(async () => {
      const body = new FormData();
      for (const [key, value] of Object.entries({ ...values, slug, pickup, dropoff, place: place ?? "" }))
        body.set(key, value);
      try {
        if (photo) {
          const { blob, extension } = await shrink(photo.file);
          body.set("ghanaCardImage", new File([blob], `ghana-card.${extension}`, { type: blob.type }));
        }
        const result = await submitRentalRequest(body);
        if (result.ok) {
          setOpen(false);
          setSent(result.code);
          setPhoto(null);
        } else {
          setErrors(result.fields ?? {});
          setFormError(result.error);
        }
      } catch {
        setFormError("Something went wrong. Check your connection and try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 lg:min-w-[200px]",
          className,
        )}
      >
        Request this car
      </button>

      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content className="fixed inset-0 z-50 overflow-y-auto bg-[#171717] text-white outline-none">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close"
                disabled={pending}
                className="fixed top-4 right-4 flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50 lg:top-6 lg:right-8"
              >
                <X className="size-7" aria-hidden />
              </button>
            </DialogPrimitive.Close>
            <div className="mx-auto flex min-h-full w-full max-w-[1104px] flex-col px-4 pt-16 pb-12 lg:pt-14">
              <header className="flex flex-col items-center gap-2 border-b border-white/80 pb-8 text-center">
                <DialogTitle className="font-display text-2xl leading-tight text-white lg:text-[32px]">
                  Request this car
                </DialogTitle>
                <DialogDescription className="max-w-[560px] text-sm text-white/80 lg:text-base">
                  Provide your contact details so we can reach you regarding your rental request.
                </DialogDescription>
                <p className="mt-1 text-sm text-white/60">
                  {title} · {summary}
                </p>
              </header>

              <form
                onSubmit={submit}
                noValidate
                className="mx-auto mt-10 flex w-full max-w-[500px] flex-col gap-4 rounded-3xl bg-black p-6"
              >
                {/* Real visitors never see this; bots fill it in. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="absolute -left-[9999px] size-0 opacity-0"
                />
                <Field label="Full name" required error={errors.fullName}>
                  <input
                    name="fullName"
                    autoComplete="name"
                    maxLength={100}
                    placeholder="Enter your full name"
                    aria-invalid={!!errors.fullName}
                    className={input}
                  />
                </Field>
                <Field label="Phone / WhatsApp" required error={errors.phone}>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={25}
                    placeholder="Enter your phone or WhatsApp number"
                    aria-invalid={!!errors.phone}
                    className={input}
                  />
                </Field>
                <Field label="Email" required error={errors.email}>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    placeholder="Enter your email address"
                    aria-invalid={!!errors.email}
                    className={input}
                  />
                </Field>

                <hr className="my-2 border-white/80" />

                <div className="flex flex-col gap-4 rounded-2xl border border-white/80 p-4 sm:p-8">
                  <p className="text-center text-base text-white/60">Upload a clear photo of your Ghana Card</p>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    aria-label={photo ? "Change the Ghana Card photo" : "Choose a Ghana Card photo"}
                    className="relative flex h-[132px] w-full items-center justify-center overflow-hidden rounded-lg bg-[#333] text-white/60 hover:bg-[#3a3a3a] focus-visible:ring-3 focus-visible:ring-primary/60"
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
                      <img src={photo.url} alt="Your Ghana Card photo" className="size-full object-cover" />
                    ) : (
                      <Camera className="size-6" aria-hidden />
                    )}
                    <Plus className="absolute right-3 bottom-3 size-4" aria-hidden />
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(event) => {
                      pick(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                  {errors.ghanaCardImage ? (
                    <p role="alert" className="text-sm text-[#ff8a8a]">
                      {errors.ghanaCardImage}
                    </p>
                  ) : null}
                </div>

                <Field label="Ghana Card Number" error={errors.ghanaCardNumber}>
                  <input
                    name="ghanaCardNumber"
                    autoComplete="off"
                    maxLength={20}
                    placeholder="GHA-"
                    aria-invalid={!!errors.ghanaCardNumber}
                    className={input}
                  />
                </Field>

                {formError ? (
                  <p role="alert" className="rounded-md bg-[#2a1215] px-3 py-2 text-sm text-[#ff8a8a]">
                    {formError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={pending}
                  className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-70"
                >
                  {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {pending ? "Sending…" : "Confirm Booking"}
                </button>
              </form>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      <Dialog open={sent !== null} onOpenChange={(next) => !next && setSent(null)}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[449px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 rounded-3xl bg-black px-4 pt-5 pb-8 text-center text-white outline-none sm:px-8">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="mr-1 flex size-8 items-center justify-center self-end rounded-full text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <X className="size-6" aria-hidden />
              </button>
            </DialogPrimitive.Close>
            <CarSwoosh />
            <div className="flex flex-col gap-3">
              <DialogTitle className="text-2xl leading-8 font-semibold text-white">
                Request Submitted Successfully!
              </DialogTitle>
              <DialogDescription className="text-base leading-6 text-white/70">
                We&apos;ve received your vehicle rental request and our team will review your details. We&apos;ll get in
                touch with you shortly to confirm availability, pricing, and the next steps.
              </DialogDescription>
              {sent && sent !== "RB-0" ? <p className="text-sm text-white/60">Your reference: {sent}</p> : null}
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}
