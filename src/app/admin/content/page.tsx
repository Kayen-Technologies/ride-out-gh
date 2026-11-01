import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { listPages } from "@/features/cms/admin/queries";
import { pageIds } from "@/features/cms/registry";

const titles: Record<string, string> = {
  global: "Header and footer",
  home: "Homepage",
  buy: "Buy",
  rent: "Rent",
  import: "Import",
  sell: "Sell",
  about: "About",
  contact: "Contact",
  policy: "Client policy",
};

export default function AdminContentPage() {
  return (
    <AdminPage title="Website content" breadcrumb="Workspace / Website content">
      <Suspense fallback={<div data-page-pending className="ro-shimmer h-40 rounded-xl" aria-hidden />}>
        <Pages />
      </Suspense>
    </AdminPage>
  );
}

async function Pages() {
  await connection();
  const summaries = new Map((await listPages()).map((row) => [row.page, row]));
  return (
    <div className="flex w-full max-w-[1008px] flex-col gap-4">
      <p className="text-base text-foreground">Change the words, pictures and videos on the public website. Nothing goes live until you press Publish.</p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {pageIds.map((page) => {
          const row = summaries.get(page);
          return (
            <li key={page}>
              <Link href={`/admin/content/${page}`} className="flex h-full flex-col gap-3 rounded-xl border border-white/20 p-6 transition-colors hover:bg-white/[0.06] focus-visible:ring-3 focus-visible:ring-ring/50">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-medium text-foreground">{titles[page]}</h2>
                  {row?.hasUnpublishedChanges ? (
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">Unpublished changes</span>
                  ) : null}
                </div>
                <p className="text-sm text-text-70">
                  {row?.publishedAt ? `Last published ${new Date(row.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "Showing the original text"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
