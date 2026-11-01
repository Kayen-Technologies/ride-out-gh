"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Car, SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { RouteProgress } from "@/components/loader/route-progress";
import { TyreSpinner } from "@/components/loader/tyre-spinner";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { saveVehicle } from "@/features/inventory/vehicle-form/actions";
import { updateVehicle } from "@/features/inventory/vehicle-form/manage-actions";
import { ImageZone } from "@/features/inventory/vehicle-form/components/image-zone";
import { SelectField, TextAreaField, TextField } from "@/features/inventory/vehicle-form/components/form-fields";
import { ReviewStep } from "@/features/inventory/vehicle-form/components/review-step";
import {
  SaveResultDialog,
  type SaveOutcome,
} from "@/features/inventory/vehicle-form/components/result-dialog";
import { WizardStepper } from "@/features/inventory/vehicle-form/components/wizard-stepper";
import { uploadVehicleImages, type PickedImage } from "@/features/inventory/vehicle-form/image-utils";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  purposeOptions,
  transmissionOptions,
  yearOptions,
} from "@/features/inventory/vehicle-form/options";
import {
  MAX_IMAGES,
  STEP_FIELDS,
  defaultVehicleValues,
  vehicleFormSchema,
  type ImageCategory,
  type VehicleFormValues,
} from "@/features/inventory/vehicle-form/schema";

type Step = 1 | 2 | 3 | 4;
type Images = Record<ImageCategory, PickedImage[]>;

const emptyImages: Images = { interior: [], exterior: [] };

/** Present when an existing vehicle is being edited instead of a new one added. */
export type EditVehicle = {
  id: string;
  status: "draft" | "published" | "hidden";
  initialValues: VehicleFormValues;
  initialImages: PickedImage[];
};

const stepTitles: Record<Step, string> = {
  1: "Add New Vehicle",
  2: "Details",
  3: "Images & Features",
  4: "Review",
};

const years = yearOptions().map((year) => ({ value: year, label: year }));

const dividerClass = "border-t border-white/50";

export function VehicleWizard({ edit }: { edit?: EditVehicle }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [images, setImages] = useState<Images>(() =>
    edit
      ? {
          interior: edit.initialImages.filter((image) => image.category === "interior"),
          exterior: edit.initialImages.filter((image) => image.category !== "interior"),
        }
      : emptyImages,
  );
  const [vehicleId, setVehicleId] = useState(() => edit?.id ?? crypto.randomUUID());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<SaveOutcome | null>(null);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema) as unknown as Resolver<VehicleFormValues>,
    defaultValues: edit?.initialValues ?? defaultVehicleValues,
    mode: "onTouched",
  });
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const purpose = useWatch({ control: form.control, name: "purpose" });
  const sale = purpose === "sale";

  // The page area scrolls, not the window: bring the top of the form back into view on every step change.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  async function next() {
    if (step === 1 || step === 2) {
      const valid = await form.trigger(STEP_FIELDS[step]);
      if (!valid) return;
    }
    setStep((current) => Math.min(4, current + 1) as Step);
  }

  function back() {
    if (step === 1) {
      router.push(edit ? `/admin/inventory/${edit.id}` : "/admin/inventory");
      return;
    }
    setStep((current) => (current - 1) as Step);
  }

  async function save(intent: "draft" | "publish") {
    if (saving) return;
    const fields = intent === "publish" ? [...STEP_FIELDS[1], ...STEP_FIELDS[2]] : STEP_FIELDS[1];
    const valid = await form.trigger(fields);
    if (!valid) {
      const firstBad = (STEP_FIELDS[1] as string[]).some((name) => name in form.formState.errors) ? 1 : 2;
      setStep(firstBad);
      toast.error("Fix the highlighted fields first.");
      return;
    }
    if (intent === "publish" && images.exterior.length === 0) {
      setStep(3);
      toast.error("Add at least one exterior photo before publishing.");
      return;
    }

    setSaving(true);
    setProgress(null);
    let uploadedPaths: string[] = [];
    try {
      const uploaded = await uploadVehicleImages(vehicleId, images, (done, total) =>
        setProgress({ done, total }),
      );
      uploadedPaths = uploaded.map((image) => image.path);
      const result = await saveVehicle({ id: vehicleId, intent, values: form.getValues(), images: uploaded });
      if (!result.ok) throw new Error(result.error);
      setOutcome(intent === "publish" ? "published" : "draft");
    } catch (error) {
      if (uploadedPaths.length) void createClient().storage.from("vehicle-images").remove(uploadedPaths);
      toast.error(error instanceof Error ? error.message : "The vehicle could not be saved.");
    } finally {
      setSaving(false);
      setProgress(null);
    }
  }

  async function saveChanges() {
    if (saving || !edit) return;
    const publishedListing = edit.status === "published";
    const fields = publishedListing ? [...STEP_FIELDS[1], ...STEP_FIELDS[2]] : STEP_FIELDS[1];
    const valid = await form.trigger(fields);
    if (!valid) {
      const firstBad = (STEP_FIELDS[1] as string[]).some((name) => name in form.formState.errors) ? 1 : 2;
      setStep(firstBad);
      toast.error("Fix the highlighted fields first.");
      return;
    }
    if (publishedListing && images.exterior.length === 0) {
      setStep(3);
      toast.error("A published vehicle needs at least one exterior photo.");
      return;
    }

    setSaving(true);
    setProgress(null);
    try {
      const uploaded = await uploadVehicleImages(vehicleId, images, (done, total) =>
        setProgress({ done, total }),
      );
      const newPaths = uploaded
        .map((image) => image.path)
        .filter((path) => !edit.initialImages.some((initial) => initial.path === path));
      const result = await updateVehicle({ id: vehicleId, values: form.getValues(), images: uploaded });
      if (!result.ok) {
        // The edit was refused, so the photos uploaded for it are not needed.
        if (newPaths.length) void createClient().storage.from("vehicle-images").remove(newPaths);
        throw new Error(result.error);
      }
      toast.success("Changes saved.");
      router.push(`/admin/inventory/${vehicleId}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The changes could not be saved.");
      setSaving(false);
      setProgress(null);
    }
  }

  function addAnother() {
    form.reset(defaultVehicleValues);
    setImages(emptyImages);
    setVehicleId(crypto.randomUUID());
    setStep(1);
    setOutcome(null);
  }

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 4) void next();
        }}
        className="flex w-full max-w-[1008px] flex-col gap-6"
      >
        <div ref={topRef} className="flex scroll-mt-6 items-center gap-2 text-foreground">
          <button type="button" onClick={back} aria-label={step === 1 ? (edit ? "Back to vehicle" : "Back to inventory") : "Previous step"} className="rounded-sm p-0.5 text-sky-300 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50">
            <ArrowLeft className="size-[18px]" aria-hidden />
          </button>
          {step < 4 ? (
            <button type="button" onClick={() => void next()} aria-label="Next step" className="rounded-sm p-0.5 text-sky-300 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50">
              <ArrowRight className="size-[18px]" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 border-b border-white/50 pb-6">
          <div className="flex items-center gap-2">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-black">
              {step === 1 ? <Car className="size-5" aria-hidden /> : <SquarePen className="size-5" aria-hidden />}
            </span>
            <div>
              <h1 className="text-base leading-5 font-medium text-foreground">{step === 1 && edit ? "Edit Vehicle" : stepTitles[step]}</h1>
              <p className="text-sm leading-5 text-foreground">Step {step} of 4</p>
            </div>
          </div>
        </div>

        <WizardStepper current={step} />

        {step === 1 ? (
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            <TextField name="name" label="Vehicle Name" required placeholder="Enter vehicle name" />
            <TextField name="brand" label="Brand" required placeholder="Enter brand name" />
            <TextField name="model" label="Model" required placeholder="Enter model type" />
            <SelectField name="year" label="Year" required placeholder="Select year" options={years} />
            <SelectField name="purpose" label="Listing purpose" required placeholder="Select purpose" options={purposeOptions} />
            <SelectField name="condition" label="Vehicle Condition" required placeholder="Select condition" options={conditionOptions} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-6">
              <h2 className="text-lg leading-6 text-foreground">Specifications</h2>
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
                <TextField name="mileage" label="Mileage (km)" placeholder="e.g. 18,000" inputMode="numeric" />
                <TextField name="exteriorColour" label="Exterior colour" placeholder="e.g. Red" />
                <SelectField name="fuelType" label="Fuel Type" required placeholder="Select fuel type" options={fuelOptions} />
                <SelectField name="transmission" label="Transmission" required placeholder="Select transmission type" options={transmissionOptions} />
                <SelectField name="bodyType" label="Body Type" required placeholder="Select body type" options={bodyTypeOptions} />
              </div>
            </section>

            <section className={`flex flex-col gap-6 ${dividerClass} pt-8`}>
              <h2 className="text-lg leading-6 text-foreground">{sale ? "Pricing" : "Rental Pricing"}</h2>
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
                {sale ? (
                  <TextField name="salePrice" label="Sale price (GH₵)" required placeholder="e.g. 200,000" inputMode="decimal" />
                ) : (
                  <>
                    <TextField name="dailyRate" label="Daily rental rate (GH₵)" required placeholder="e.g. 650" inputMode="decimal" />
                    <TextField name="securityDeposit" label="Security deposit (GH₵)" placeholder="e.g. 1,000" inputMode="decimal" />
                  </>
                )}
              </div>
            </section>

            <section className={`flex flex-col gap-6 ${dividerClass} pt-8`}>
              <h2 className="text-lg leading-6 text-foreground">Identification &amp; location</h2>
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
                <TextField name="location" label="Vehicle location" required placeholder="e.g. Accra" />
                <TextField name="registration" label="Registration number" placeholder="Enter registration" />
              </div>
              <TextAreaField name="description" label="Description" placeholder="Describe the vehicle's features and condition..." />
            </section>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-6">
            <ImageZone
              title="Interior Images"
              label="Vehicle Interior"
              hint={["Upload 3–6 shots of seats, dashboard, trunk, or infotainment", "Recommended: 1200x800px, clear daylight photos"]}
              max={MAX_IMAGES.interior}
              images={images.interior}
              onChange={(interior) => setImages((current) => ({ ...current, interior }))}
            />
            <ImageZone
              title="Exterior Images"
              label="Vehicle Exterior"
              hint={["Upload 1–5 high-quality exterior shots (front, side, rear, angle)", "Recommended: 1200x800px, clear daylight photos"]}
              note="Upload multiple exterior images to create a rotating 360° view of the vehicle. We recommend uploading 8–12 clear images showing the car from different angles."
              max={MAX_IMAGES.exterior}
              images={images.exterior}
              onChange={(exterior) => setImages((current) => ({ ...current, exterior }))}
            />
          </div>
        ) : null}

        {step === 4 ? (
          <ReviewStep values={form.getValues()} images={images} goTo={(target) => setStep(target)} />
        ) : null}

        <div className="flex items-center justify-between gap-4 rounded-xl bg-[#404040] p-4 sm:p-6">
          {edit ? (
            <Link
              href={`/admin/inventory/${edit.id}`}
              className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-[145px]"
            >
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void save("draft")}
              className="inline-flex h-10 min-w-[120px] items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black hover:bg-white/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 sm:w-[145px]"
            >
              Save Draft
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => void next()}
              className="inline-flex h-10 min-w-[100px] items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-black hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-[145px]"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void (edit ? saveChanges() : save("publish"))}
              className="inline-flex h-10 min-w-[140px] items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-black hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 sm:w-[145px]"
            >
              {edit ? "Save changes" : "Publish listing"}
            </button>
          )}
        </div>
      </form>

      {saving ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[70] flex cursor-progress items-center justify-center bg-black/50 px-4 backdrop-blur-md"
        >
          <div className="flex w-full max-w-sm flex-col gap-5 rounded-2xl bg-black p-6 text-foreground ring-1 ring-white/15">
            {progress && progress.total > 0 ? (
              <RouteProgress label="Uploading photos" value={progress.done} max={progress.total} />
            ) : (
              <div className="flex items-center gap-3 text-base font-medium">
                <TyreSpinner size={24} label="Saving" />
                Saving vehicle…
              </div>
            )}
          </div>
        </div>
      ) : null}

      <SaveResultDialog
        outcome={outcome}
        onViewInventory={() => router.push("/admin/inventory")}
        onAddAnother={addAnother}
      />
    </FormProvider>
  );
}
