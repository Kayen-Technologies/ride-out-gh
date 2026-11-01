"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { TyreSpinner } from "@/components/loader/tyre-spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  requestPasswordReset,
  resetPassword,
  signOut,
} from "@/features/auth/actions";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/features/auth/schema";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    const result = await requestPasswordReset(values);
    if (result?.error) toast.error(result.error);
  }

  // Figma 120:9769 (desktop) and 120:10589 (mobile).
  return (
    <div className="flex w-full flex-col items-center gap-[25px] lg:gap-8">
      <div className="flex w-full flex-col items-center text-center text-white lg:gap-2">
        <h1 className="text-2xl leading-10 font-medium whitespace-nowrap lg:text-[32px]">
          Forgot Password?
        </h1>
        <p className="text-sm leading-[22px] tracking-[-0.18px] lg:text-base">
          Enter the email that you used when you signed up to recover your
          password. You will receive a password reset link.
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-[25px]">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex w-full flex-col gap-5 lg:gap-6"
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-1.5">
                <FieldLabel
                  htmlFor="forgot-email"
                  className="text-sm font-medium text-white"
                >
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="lg:text-base"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <TyreSpinner size={16} tone="dark" />
            ) : null}
            {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <BackToLogin />
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  const [updated, setUpdated] = useState(false);
  const [visible, setVisible] = useState(false);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    const result = await resetPassword(values);
    if (result?.error) toast.error(result.error);
    if (result?.ok) setUpdated(true);
  }

  // Figma 120:9787 (desktop), 120:9921 (mobile).
  return (
    <div className="flex w-full flex-col items-center gap-[25px] lg:gap-8">
      <div className="flex w-full flex-col items-center text-center text-white lg:gap-2">
        <h1 className="text-2xl leading-10 font-medium whitespace-nowrap lg:text-[32px]">
          Create a new password
        </h1>
        <p className="text-sm leading-[22px] tracking-[-0.18px] lg:text-base">
          Choose a strong password to keep your Ride-Out account secure.
        </p>
      </div>
      <div className="flex w-full flex-col items-center gap-[25px]">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex w-full flex-col gap-6"
        >
          <PasswordField
            id="new-password"
            name="password"
            label="New password"
            placeholder="Enter new password"
            autoComplete="new-password"
            visible={visible}
            onToggle={() => setVisible((current) => !current)}
            control={form.control}
          />
          <PasswordField
            id="confirm-password"
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            visible={visible}
            onToggle={() => setVisible((current) => !current)}
            control={form.control}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <TyreSpinner size={16} tone="dark" />
            ) : null}
            {form.formState.isSubmitting ? "Saving…" : "Reset Password"}
          </Button>
        </form>
        <BackToLogin />
      </div>
      {updated ? <PasswordUpdated /> : null}
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  visible,
  onToggle,
  control,
}: {
  id: string;
  name: "password" | "confirmPassword";
  label: string;
  placeholder: string;
  autoComplete: string;
  visible: boolean;
  onToggle: () => void;
  control: ReturnType<typeof useForm<ResetPasswordValues>>["control"];
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-1.5">
          <FieldLabel htmlFor={id} className="text-sm font-medium text-white">
            {label}
          </FieldLabel>
          <div className="relative">
            <Input
              {...field}
              id={id}
              type={visible ? "text" : "password"}
              autoComplete={autoComplete}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className="pr-10 placeholder:text-white/60 lg:text-base"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3.5 -translate-y-1/2"
              onClick={onToggle}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              <Image src="/brand/eye.svg" alt="" width={18} height={13} />
            </button>
          </div>
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      )}
    />
  );
}

function BackToLogin() {
  return (
    <Link
      href="/login"
      className="flex items-center gap-1.5 text-sm font-semibold text-white"
    >
      <Image src="/brand/arrow-left.svg" alt="" width={20} height={20} />
      Back to log in
    </Link>
  );
}

function PasswordUpdated() {
  // Figma 120:9830 (desktop 449 x 440) and 120:10540 (mobile 358 x 425). Overlay: #111 at 90% with a 10px blur.
  // On mobile Figma places the card 7px above centre (overlay is offset 16px), hence pb-3.5.
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-4 pb-3.5 backdrop-blur-[10px] lg:pb-0">
      <div className="flex w-full max-w-[358px] flex-col rounded-[20px] bg-black px-8 pt-[72px] pb-10 text-center lg:max-w-[449px]">
        <div className="flex flex-col gap-10">
          <div className="flex justify-center">
            <Image
              src="/brand/car.svg"
              alt=""
              width={321}
              height={67}
              className="max-w-none shrink-0"
            />
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-2xl leading-[1.1] font-bold tracking-[-0.48px] text-white lg:text-[26px] lg:tracking-[-0.52px]">
              Password updated!
            </p>
            <p className="text-sm leading-[1.5] text-white/70 lg:text-base">
              Your password has been changed successfully. You can now sign in
              to your Ride-Out account using your new password.
              <br />
              Continue to Sign In
            </p>
          </div>
        </div>
        <form action={signOut} className="mt-8">
          <Button type="submit" size="lg" className="w-full lg:text-[15px]">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
