"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { GoogleButton, OrDivider } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInFromForm } from "@/features/auth/actions";
import { signInSchema, type SignInValues } from "@/features/auth/schema";

export function SignInForm() {
  const [remember, setRemember] = useState(false);
  const [state, submit, pending] = useActionState(signInFromForm, null);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="flex flex-col items-center gap-[25px]">
      <div className="flex w-[283px] flex-col items-center text-center text-white">
        <h1 className="text-2xl leading-10 font-medium">Login to account</h1>
        <p className="text-sm leading-[22px] tracking-[-0.18px]">Enter the fields below to log in</p>
      </div>
      <div className="flex w-full flex-col gap-4">
        <GoogleButton label="Sign in with Google" />
        <OrDivider />
      </div>
      <form
        action={submit}
        noValidate
        className="flex w-full flex-col gap-5"
        onSubmit={(event) => {
          const parsed = signInSchema.safeParse(form.getValues());
          if (!parsed.success) {
            event.preventDefault();
            void form.trigger();
          }
        }}
      >
        <input type="hidden" name="remember" value={remember ? "1" : "0"} />
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1.5">
              <FieldLabel htmlFor="sign-in-email" className="text-sm font-medium text-white">
                Email
              </FieldLabel>
              <Input
                {...field}
                id="sign-in-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1.5">
              <FieldLabel htmlFor="sign-in-password" className="text-sm font-medium text-white">
                Password
              </FieldLabel>
              <Input
                {...field}
                id="sign-in-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
        <div className="flex items-center justify-between text-sm text-white">
          <label className="flex items-center gap-2.5">
            <Checkbox
              checked={remember}
              onCheckedChange={(checked) => setRemember(checked === true)}
              className="size-5 rounded-[5px] border-2 border-neutral-600 bg-secondary"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="font-medium text-primary">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="w-full text-sm font-medium text-white">
        Don’t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-primary">
          Create one
        </Link>
      </p>
    </div>
  );
}
