"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";

export type SaveOutcome = "published" | "draft";

function CarSwoosh() {
  return (
    <svg viewBox="0 0 330 70" aria-hidden className="h-[58px] w-[280px]">
      <path
        d="M4 66 C20 38 48 24 84 22 C112 20 128 22 152 10 C176 -2 214 -2 244 12 C262 20 290 24 326 24"
        fill="none"
        stroke="#FFD400"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M30 50 C48 36 66 32 92 32" fill="none" stroke="#FFD400" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** The two success dialogs from Figma (120:4809 live, 120:4828 draft): black card, centred art and copy. */
export function SaveResultDialog({
  outcome,
  onViewInventory,
  onAddAnother,
}: {
  outcome: SaveOutcome | null;
  onViewInventory: () => void;
  onAddAnother: () => void;
}) {
  const live = outcome === "published";
  return (
    <Dialog open={outcome !== null} onOpenChange={(open) => !open && onViewInventory()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[449px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 rounded-3xl bg-black px-4 pt-5 pb-8 text-center text-foreground outline-none sm:px-8">
          <DialogPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="mr-1 flex size-8 items-center justify-center self-end rounded-full text-white hover:bg-white/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-6" aria-hidden />
            </button>
          </DialogPrimitive.Close>

          {live ? <CarSwoosh /> : <Save className="size-[100px] text-primary" strokeWidth={1.25} aria-hidden />}

          <div className="flex flex-col gap-3">
            <DialogTitle className="text-2xl leading-8 font-semibold text-white">
              {live ? "Your vehicle is live!" : "Your draft is saved"}
            </DialogTitle>
            <DialogDescription className="text-base leading-6 text-text-70">
              {live
                ? "The vehicle has been added to your inventory and its listing is now visible to customers."
                : "Your vehicle details have been saved. The listing is not visible to customers yet, and you can continue editing it whenever you're ready."}
            </DialogDescription>
          </div>

          <div className="flex w-full flex-col gap-3">
            {live ? (
              <>
                <Button
                  type="button"
                  onClick={onViewInventory}
                  className="h-12 w-full rounded-full bg-primary text-base font-medium text-black hover:bg-primary/90"
                >
                  View vehicle in inventory
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onAddAnother}
                  className="h-12 w-full rounded-full border-white bg-transparent text-base font-medium text-white hover:bg-white/10 dark:border-white dark:bg-transparent dark:hover:bg-white/10"
                >
                  Add another vehicle
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onViewInventory}
                className="h-12 w-full rounded-full border-white bg-transparent text-base font-medium text-white hover:bg-white/10 dark:border-white dark:bg-transparent dark:hover:bg-white/10"
              >
                Back to inventory
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
