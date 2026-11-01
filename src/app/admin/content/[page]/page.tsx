import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { PageEditor } from "@/features/cms/admin/components/page-editor";
import { getDraft } from "@/features/cms/admin/queries";
import { pageIds, type PageId } from "@/features/cms/registry";

type PageProps = { params: Promise<{ page: string }> };

const titles: Record<string, string> = {
  global: "Header and footer", home: "Homepage", buy: "Buy", rent: "Rent", import: "Import",
  sell: "Sell", about: "About", contact: "Contact", policy: "Client policy",
};

export default function AdminContentEditPage({ params }: PageProps) {
  return (
    <AdminPage title="Website content" breadcrumb="Workspace / Website content / Edit">
      <Suspense fallback={<div data-page-pending className="ro-shimmer h-64 w-full max-w-[1008px] rounded-xl" aria-hidden />}>
        <Editor params={params} />
      </Suspense>
    </AdminPage>
  );
}

async function Editor({ params }: PageProps) {
  await connection();
  const { page } = await params;
  if (!(pageIds as readonly string[]).includes(page)) notFound();
  const draft = await getDraft(page as PageId);
  if (!draft) notFound();
  return (
    <>
      <h1 className="sr-only">{titles[page]}</h1>
      <PageEditor
        page={page as PageId}
        initialValues={draft.values}
        initialVersion={draft.version}
        initialUnpublished={draft.hasUnpublishedChanges}
      />
    </>
  );
}
