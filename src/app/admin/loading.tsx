import { InlineCarLoader } from "@/components/loader/inline-car-loader";

/** Shown inside the admin panel while a page loads, so the sidebar stays put (the full-screen loader is for the site). */
export default function AdminLoading() {
  return (
    <div data-page-pending className="flex flex-1 items-center justify-center py-24">
      <InlineCarLoader label="Loading" hint="checking the lot…" />
    </div>
  );
}
