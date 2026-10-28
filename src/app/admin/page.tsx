import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";

export default function AdminPage() {
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-muted-foreground">
        The dashboard screens are not built yet. This page only proves the staff gate.
      </p>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </main>
  );
}
