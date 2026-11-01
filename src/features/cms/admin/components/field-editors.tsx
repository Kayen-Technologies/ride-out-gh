"use client";

import { ArrowDown, ArrowUp, Film, ImageUp, Plus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import { TyreSpinner } from "@/components/loader/tyre-spinner";
import { mediaProblem, uploadSiteMedia } from "@/features/cms/admin/media-upload";
import { cn } from "cn";

export type Img = { src: string; alt: string };
export type Vid = { src: string; poster: string };
type Item = string | Record<string, unknown>;

const inputClass =
  "h-11 w-full rounded-md border border-input-border bg-input px-3.5 text-sm text-foreground outline-none placeholder:text-text-70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const labelClass = "text-sm leading-5 font-medium text-foreground";

export function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={cn("text-xs tabular-nums", over ? "text-destructive" : "text-text-70")} aria-live="polite">
      {value.length}/{max}
    </span>
  );
}

export function TextEditor({
  label,
  value,
  max,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  max: number;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <Counter value={value} max={max} />
      </div>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          maxLength={max}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[88px] w-full resize-y rounded-md border border-input-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : (
        <input id={id} value={value} maxLength={max} onChange={(event) => onChange(event.target.value)} className={inputClass} />
      )}
    </div>
  );
}

function useUpload(kind: "image" | "video", folder: string, onDone: (url: string) => void) {
  const [busy, setBusy] = useState(false);
  async function pick(file: File | undefined) {
    if (!file) return;
    const problem = mediaProblem(file, kind);
    if (problem) {
      toast.error(problem);
      return;
    }
    setBusy(true);
    try {
      onDone(await uploadSiteMedia(file, folder));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The upload failed.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, pick };
}

export function ImageEditor({
  label,
  hint,
  value,
  original,
  folder,
  onChange,
}: {
  label: string;
  hint?: string;
  value: Img;
  /** The picture the site shipped with; when set and different, "Use original" puts it back. */
  original?: Img;
  folder: string;
  onChange: (value: Img) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const altId = useId();
  const { busy, pick } = useUpload("image", folder, (src) => onChange({ ...value, src }));
  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex h-[120px] w-full shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/20 bg-[#111] sm:w-[180px]">
          {value.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- editor preview of an arbitrary uploaded picture
            <img src={value.src} alt={value.alt} className="size-full object-contain" />
          ) : (
            <span className="text-xs text-text-70">No picture</span>
          )}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/60">
              <TyreSpinner size={24} label="Uploading" />
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label htmlFor={altId} className="text-xs text-text-70">
            Describe the picture (for screen readers and search)
          </label>
          <input id={altId} value={value.alt} maxLength={125} onChange={(event) => onChange({ ...value, alt: event.target.value })} className={inputClass} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-medium text-foreground hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              <ImageUp className="size-4" aria-hidden />
              {value.src ? "Replace picture" : "Upload picture"}
            </button>
            {original?.src && original.src !== value.src ? (
              <button type="button" onClick={() => onChange({ ...value, src: original.src })} className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-text-70 hover:bg-white/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
                Use original
              </button>
            ) : null}
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="sr-only" tabIndex={-1} onChange={(event) => { void pick(event.target.files?.[0]); event.target.value = ""; }} />
          </div>
          {hint ? <p className="text-xs leading-4 text-text-70">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function VideoEditor({ label, hint, value, folder, onChange }: { label: string; hint?: string; value: Vid; folder: string; onChange: (value: Vid) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, pick } = useUpload("video", folder, (src) => onChange({ ...value, src }));
  return (
    <div className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex h-[120px] w-full shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/20 bg-[#111] sm:w-[180px]">
          {value.src ? <video src={value.src} muted loop playsInline controls className="size-full object-contain" /> : <span className="flex items-center gap-2 text-xs text-text-70"><Film className="size-4" aria-hidden />No video</span>}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/60">
              <TyreSpinner size={24} label="Uploading" />
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-medium text-foreground hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60">
              <Film className="size-4" aria-hidden />
              {value.src ? "Replace video" : "Upload video"}
            </button>
            {value.src ? (
              <button type="button" onClick={() => onChange({ ...value, src: "" })} className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium text-destructive hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-destructive/40">
                <Trash2 className="size-4" aria-hidden />
                Remove video
              </button>
            ) : null}
            <input ref={input} type="file" accept="video/mp4,video/webm" className="sr-only" tabIndex={-1} onChange={(event) => { void pick(event.target.files?.[0]); event.target.value = ""; }} />
          </div>
          {hint ? <p className="text-xs leading-4 text-text-70">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

const humanize = (key: string) => (key === "cta" ? "Call to action" : key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()));
const ORDER = ["title", "body", "cta", "category", "image", "image_mobile"];
const byOrder = ([a]: [string, unknown], [b]: [string, unknown]) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99);

function blankLike(sample: Item | undefined): Item {
  if (typeof sample === "string" || sample === undefined) return "";
  const blank: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sample)) {
    blank[key] = typeof value === "object" && value !== null ? { src: "", alt: "" } : "";
  }
  return blank;
}

export function ListEditor({
  label,
  items,
  defaults,
  sample,
  max,
  folder,
  onChange,
}: {
  label: string;
  items: Item[];
  defaults: readonly Item[];
  sample: Item | undefined;
  max: number;
  folder: string;
  onChange: (items: Item[]) => void;
}) {
  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <div className="flex flex-col gap-3">
      <span className={labelClass}>{label}</span>
      <ul className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={index} className="flex flex-col gap-3 rounded-lg border border-white/20 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-70">Item {index + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="flex size-8 items-center justify-center rounded-full text-foreground hover:bg-white/10 disabled:opacity-30">
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button type="button" aria-label="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)} className="flex size-8 items-center justify-center rounded-full text-foreground hover:bg-white/10 disabled:opacity-30">
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button type="button" aria-label={`Remove item ${index + 1}`} disabled={items.length <= 1} onClick={() => onChange(items.filter((_, i) => i !== index))} className="flex size-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-30">
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            {typeof item === "string" ? (
              <TextEditor label="Text" value={item} max={max} onChange={(value) => onChange(items.map((it, i) => (i === index ? value : it)))} />
            ) : (
              Object.entries(item).sort(byOrder).map(([key, value]) => {
                const set = (next: unknown) => onChange(items.map((it, i) => (i === index ? { ...(it as Record<string, unknown>), [key]: next } : it)));
                if (typeof value === "object" && value !== null) {
                  const base = defaults[index];
                  const original = typeof base === "object" && base !== null ? ((base as Record<string, unknown>)[key] as Img | undefined) : undefined;
                  return <ImageEditor key={key} label={humanize(key === "image_mobile" ? "mobile picture" : "picture")} value={value as Img} original={original} folder={folder} onChange={set} />;
                }
                return (
                  <TextEditor key={key} label={humanize(key === "cta" ? "button label" : key)} value={String(value ?? "")} max={key === "body" ? 600 : max} multiline={key === "body"} onChange={set} />
                );
              })
            )}
          </li>
        ))}
      </ul>
      {items.length < 24 ? (
        <button type="button" onClick={() => onChange([...items, blankLike(sample)])} className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-white/50 px-4 text-sm font-medium text-foreground hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50">
          <Plus className="size-4" aria-hidden />
          Add item
        </button>
      ) : null}
    </div>
  );
}
