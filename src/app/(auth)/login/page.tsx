import Link from "next/link";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Staff and customers use the same sign-in.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Suspense>
            <AuthError searchParams={searchParams} />
          </Suspense>
          <SignInForm />
          <p className="text-sm text-muted-foreground">
            No account yet? <Link href="/sign-up">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (params.error !== "auth") return null;
  return <p className="text-sm text-destructive">The sign-in link failed. Try again.</p>;
}
