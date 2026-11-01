"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";

import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { TyreSpinner } from "@/components/loader/tyre-spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUp } from "@/features/auth/actions";
import { signUpSchema, type SignUpValues } from "@/features/auth/schema";

export function SignUpForm() {
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: SignUpValues) {
    const result = await signUp(values);
    if (result?.error) toast.error(result.error);
  }

  return (
    // Figma 120:9659 (desktop), 120:9884 (mobile).
    <div className="flex flex-col items-center gap-[25px] lg:items-start lg:gap-6">
      <div className="flex w-[283px] flex-col items-center text-center text-white lg:w-[400px] lg:gap-2">
        <h1 className="text-2xl leading-10 font-medium lg:text-[32px]">
          Create your account
        </h1>
        <p className="text-sm leading-[22px] tracking-[-0.18px] lg:text-base">
          Enter the fields below to get started
        </p>
      </div>
      <div className="flex w-full flex-col gap-4">
        <GoogleButton label="Sign up with Google" />
        <OrDivider />
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex w-full flex-col gap-5"
      >
        <Controller
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1.5">
              <FieldLabel
                htmlFor="sign-up-name"
                className="text-sm font-medium text-white"
              >
                Name
              </FieldLabel>
              <Input
                {...field}
                id="sign-up-name"
                autoComplete="name"
                placeholder="Enter your name"
                className="lg:text-base"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1.5">
              <FieldLabel
                htmlFor="sign-up-email"
                className="text-sm font-medium text-white"
              >
                Email
              </FieldLabel>
              <Input
                {...field}
                id="sign-up-email"
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
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1.5">
              <FieldLabel
                htmlFor="sign-up-password"
                className="text-sm font-medium text-white"
              >
                Password
              </FieldLabel>
              <Input
                {...field}
                id="sign-up-password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
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
          {form.formState.isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      {/* Figma has this line on desktop only; it stays on mobile so nobody is stranded on sign up. */}
      <p className="flex w-full flex-wrap items-center justify-start gap-2 text-sm font-medium text-white lg:w-auto">
        <span className="tracking-[-0.13px] lg:leading-4">
          Already have an account?
        </span>
        <Link href="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}
