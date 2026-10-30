"use server";

import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
  type SignInValues,
  type SignUpValues,
  type VerifyEmailValues,
} from "@/features/auth/schema";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const missingConfig = "Supabase is not configured. Add the project URL and publishable key to .env.local.";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signIn(input: SignInValues, remember = false) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the email and password." };
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient({ persistSession: remember });
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim().toLowerCase(),
    password: parsed.data.password,
  });

  if (error) return { error: error.message };
  redirect("/");
}

export async function signInFromForm(_prev: { error: string } | null, formData: FormData) {
  return (
    (await signIn(
      {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      },
      formData.get("remember") === "1",
    )) ?? null
  );
}

export async function signUp(input: SignUpValues) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the name, email, and password." };
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient();
  const email = parsed.data.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName.trim() },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  if (!data.session) redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  redirect("/");
}

export async function signInWithGoogle() {
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });

  if (error) return { error: error.message };
  if (!data.url) return { error: "Google sign-in did not return a link." };
  redirect(data.url);
}

export async function requestPasswordReset(input: ForgotPasswordValues) {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a valid email." };
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email.trim().toLowerCase(), {
    redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function resetPassword(input: ResetPasswordValues) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the passwords." };
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function verifyEmail(input: VerifyEmailValues) {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter the 6-digit code." };
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email.trim().toLowerCase(),
    token: parsed.data.token,
    type: "signup",
  });

  if (error) return { error: error.message };
  redirect("/");
}

export async function resendVerification(email: string) {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) return { error: "Enter a valid email." };
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email.trim().toLowerCase(),
    options: { emailRedirectTo: `${siteUrl()}/auth/callback` },
  });

  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
