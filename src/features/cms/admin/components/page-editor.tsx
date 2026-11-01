"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { TyreSpinner } from "@/components/loader/tyre-spinner";
import { publishPage, saveDraft } from "@/features/cms/admin/actions";
import { ImageEditor, ListEditor, TextEditor, VideoEditor, type Img, type Vid } from "@/features/cms/admin/components/field-editors";
import { isField, registry, type PageId } from "@/features/cms/registry";

type Json = Record<string, unknown>;

const humanize = (key: string) => (key === "cta" ? "Call to action" : key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()));

function setAt(tree: Json, path: string[], value: unknown): Json {
  const [head, ...rest] = path;
  return { ...tree, [head]: rest.length ? setAt((tree[head] as Json) ?? {}, rest, value) : value };
}

export function PageEditor({
  page,
  initialValues,
  initialVersion,
  initialUnpublished,
}: {
  page: PageId;
  initialValues: Json;
  initialVersion: number;
  initialUnpublished: boolean;
}) {
  const [values, setValues] = useState<Json>(initialValues);
  const [version, setVersion] = useState(initialVersion);
  const [dirty, setDirty] = useState(false);
  const [unpublished, setUnpublished] = useState(initialUnpublished);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update(path: string[], value: unknown) {
    setValues((current) => setAt(current, path, value));
    setDirty(true);
  }

  function run(kind: "save" | "publish") {
    startTransition(async () => {
      const result = await (kind === "save" ? saveDraft : publishPage)(page, values, version);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setVersion(result.version);
      setUnpublished(result.hasUnpublishedChanges);
      setDirty(false);
      toast.success(kind === "save" ? "Draft saved. The live site has not changed." : "Published. It is live on the site now.");
    });
  }

  const folder = page;

  function renderBranch(branch: object, path: string[], depth: number): React.ReactNode {
    return Object.entries(branch).map(([key, field]) => {
      const here = [...path, key];
      const value = path.reduce<unknown>((node, k) => (node as Json)?.[k], values) as Json | undefined;
      const current = value?.[key];
      if (!isField(field)) {
        if (depth === 0) {
          return (
            <details key={key} open className="group rounded-xl border border-white/20 bg-white/[0.03]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-base font-medium text-foreground">
                {humanize(key)}
                <span aria-hidden className="text-text-70 transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="flex flex-col gap-6 border-t border-white/10 p-6">{renderBranch(field as object, here, depth + 1)}</div>
            </details>
          );
        }
        return (
          <div key={key} className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-text-70">{humanize(key)}</h3>
            {renderBranch(field as object, here, depth + 1)}
          </div>
        );
      }
      if (field.type === "image") return <ImageEditor key={key} label={humanize(key)} hint={field.hint} value={current as Img} original={field.default} folder={folder} onChange={(v) => update(here, v)} />;
      if (field.type === "video") return <VideoEditor key={key} label={humanize(key)} hint={field.hint} value={current as Vid} folder={folder} onChange={(v) => update(here, v)} />;
      if (field.type === "list") {
        return (
          <ListEditor
            key={key}
            label={humanize(key)}
            items={(Array.isArray(current) ? current : []) as (string | Json)[]}
            defaults={field.default as readonly (string | Json)[]}
            sample={field.default[0] as string | Json | undefined}
            max={field.maxLength}
            folder={folder}
            onChange={(items) => update(here, items)}
          />
        );
      }
      return (
        <TextEditor
          key={key}
          label={humanize(key === "cta" ? "button label" : key)}
          value={String(current ?? "")}
          max={field.maxLength}
          multiline={field.type === "paragraph"}
          onChange={(v) => update(here, v)}
        />
      );
    });
  }

  return (
    <div className="flex w-full max-w-[1008px] flex-col gap-6 pb-28">
      <div className="flex flex-col gap-4">{renderBranch(registry[page], [], 0)}</div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#111]/95 px-4 py-3 backdrop-blur lg:left-[var(--admin-sidebar-w)]">
        <div className="mx-auto flex max-w-[1008px] flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-70" aria-live="polite">
            {dirty ? "Unsaved changes" : unpublished ? "Saved as a draft, not live yet" : "Everything is saved and live"}
          </p>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-foreground hover:bg-white/10">
              View site
            </Link>
            <button type="button" disabled={pending || !dirty} onClick={() => run("save")} className="inline-flex h-10 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50">
              Save draft
            </button>
            <button type="button" disabled={pending || (!dirty && !unpublished)} onClick={() => run("publish")} className="inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-black hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50">
              {pending ? <TyreSpinner size={16} tone="dark" label="Working" /> : null}
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
