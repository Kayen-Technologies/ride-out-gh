import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Use the same email you put on a request. That is how earlier requests are attached.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <SignUpForm />
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
