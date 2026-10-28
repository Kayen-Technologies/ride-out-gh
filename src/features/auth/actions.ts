"use server";

import { redirect } from "next/navigation";

import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/features/auth/schema";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const missingConfig = "Supabase is not configured. Add the project URL and publishable key to .env.local.";

export async function signIn(input: SignInValues) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the email and password." };
  if (!hasSupabaseEnv()) return { error: missingConfig };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim().toLowerCase(),
    password: parsed.data.password,
  });

  if (error) return { error: error.message };
  redirect("/");
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
  if (!data.session) {
    return { message: "Check your email to confirm the account, then sign in." };
  }
  redirect("/");
}

export async function signOut() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
