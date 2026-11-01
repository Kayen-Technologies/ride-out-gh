"use client";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UploadCloud, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import {
  ACCEPTED_IMAGE_TYPES,
  rejectReason,
  type PickedImage,
} from "@/features/inventory/vehicle-form/image-utils";
import { cn } from "cn";

type ImageZoneProps = {
  title: string;
  label: string;
  hint: [string, string];
  note?: string;
  max: number;
  images: PickedImage[];
  onChange: (images: PickedImage[]) => void;
};

/** One dashed upload area with a sortable grid of photo tiles; the first tile is the default photo. */
export function ImageZone({ title, label, hint, note, max, images, onChange }: ImageZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function addFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList);
    const room = max - images.length;
    const accepted: PickedImage[] = [];
    for (const file of incoming) {
      const reason = rejectReason(file);
      if (reason) {
        toast.error(reason);
        continue;
      }
      if (accepted.length >= room) {
        toast.error(`You can add up to ${max} photos here.`);
        break;
      }
      accepted.push({ key: crypto.randomUUID(), name: file.name, file, previewUrl: URL.createObjectURL(file) });
    }
    if (accepted.length) onChange([...images, ...accepted]);
  }

  function remove(key: string) {
    const target = images.find((image) => image.key === key);
    if (target?.file) URL.revokeObjectURL(target.previewUrl);
    onChange(images.filter((image) => image.key !== key));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = images.findIndex((image) => image.key === active.id);
    const to = images.findIndex((image) => image.key === over.id);
    if (from >= 0 && to >= 0) onChange(arrayMove(images, from, to));
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-[#404040] p-4 sm:p-6">
      <h2 className="text-lg leading-6 font-medium text-foreground sm:text-xl">{title}</h2>
      <div className="flex flex-col gap-2">
        <span className="text-sm leading-5 text-foreground">{label}</span>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            addFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col gap-5 rounded-lg border border-dashed border-white/70 p-4 sm:p-5",
            dragOver && "border-primary bg-primary/10",
          )}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={images.length >= max}
            className="flex w-full flex-col items-center gap-2 text-center text-xs leading-[18px] text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 sm:text-[13px]"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-white text-black">
              <UploadCloud className="size-4" aria-hidden />
            </span>
            <span>
              {hint[0]}
              <br />
              {hint[1]}
            </span>
          </button>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-label={`Add ${label.toLowerCase()} photos`}
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {images.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={images.map((image) => image.key)} strategy={rectSortingStrategy}>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {images.map((image, index) => (
                    <PhotoTile
                      key={image.key}
                      image={image}
                      isDefault={index === 0}
                      onRemove={() => remove(image.key)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : null}
        </div>
      </div>
      {note ? <p className="text-xs leading-[18px] text-foreground">{note}</p> : null}
      {images.length > 1 ? (
        <p className="text-xs leading-[18px] text-text-70">Drag photos to reorder. The first one is the default.</p>
      ) : null}
    </section>
  );
}

function PhotoTile({
  image,
  isDefault,
  onRemove,
}: {
  image: PickedImage;
  isDefault: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.key,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-[4/3] cursor-grab touch-none rounded-xl bg-[#2e2e2e] p-2 active:cursor-grabbing",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a remote asset */}
      <img
        src={image.previewUrl}
        alt={image.name}
        draggable={false}
        className="size-full rounded-lg bg-[#666] object-cover"
      />
      {isDefault ? (
        <span className="absolute top-3.5 left-3.5 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] leading-3 font-medium text-black">
          Default
        </span>
      ) : null}
      <button
        type="button"
        aria-label={`Remove ${image.name}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={onRemove}
        className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-black/70 text-white opacity-100 transition-opacity hover:bg-black focus-visible:ring-3 focus-visible:ring-ring/50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </li>
  );
}
