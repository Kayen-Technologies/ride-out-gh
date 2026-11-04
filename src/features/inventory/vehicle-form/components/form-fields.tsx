"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { labelFor } from "@/features/inventory/vehicle-form/options";
import type { VehicleFormValues } from "@/features/inventory/vehicle-form/schema";
import { cn } from "cn";

type Option = { value: string; label: string };

/** The fields that hold text. `featured` is a yes/no switch and has its own control below. */
type StringField = {
  [K in keyof VehicleFormValues]: VehicleFormValues[K] extends string ? K : never;
}[keyof VehicleFormValues];

const controlClass = "h-11 w-full rounded-md border border-input-border bg-input px-3.5 text-sm text-foreground";

/** Label, control and error, in the admin form's 6 px / 20 px rhythm. */
export function FormField({
  label,
  required,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex gap-0.5 text-sm leading-5 font-medium text-foreground">
        {label}
        {required ? (
          <span aria-hidden className="text-primary">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs leading-4 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  required,
  placeholder,
  inputMode,
  className,
}: {
  name: StringField;
  label: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: "numeric" | "decimal" | "text";
  className?: string;
}) {
  const { register, formState } = useFormContext<VehicleFormValues>();
  const error = formState.errors[name]?.message;
  return (
    <FormField label={label} required={required} error={error} htmlFor={`vehicle-${name}`} className={className}>
      <Input
        id={`vehicle-${name}`}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        {...register(name)}
      />
    </FormField>
  );
}

export function SelectField({
  name,
  label,
  required,
  placeholder,
  options,
  className,
}: {
  name: StringField;
  label: string;
  required?: boolean;
  placeholder: string;
  options: readonly Option[];
  className?: string;
}) {
  const { control, formState } = useFormContext<VehicleFormValues>();
  const error = formState.errors[name]?.message;
  return (
    <FormField label={label} required={required} error={error} htmlFor={`vehicle-${name}`} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger
              id={`vehicle-${name}`}
              aria-invalid={error ? true : undefined}
              onBlur={field.onBlur}
              className={cn(
                controlClass,
                "data-[size=default]:h-11 dark:bg-input dark:hover:bg-input data-placeholder:text-foreground",
              )}
            >
              <SelectValue placeholder={placeholder}>{labelFor(options, field.value) || undefined}</SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-72">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

export function TextAreaField({
  name,
  label,
  placeholder,
}: {
  name: StringField;
  label: string;
  placeholder?: string;
}) {
  const { register, formState } = useFormContext<VehicleFormValues>();
  const error = formState.errors[name]?.message;
  return (
    <FormField label={label} error={error} htmlFor={`vehicle-${name}`}>
      <textarea
        id={`vehicle-${name}`}
        rows={4}
        placeholder={placeholder}
        className="min-h-[88px] w-full resize-y rounded-md border border-input-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        {...register(name)}
      />
    </FormField>
  );
}

/** "Feature on homepage": a switch, plus the position among featured cars when it is on (1 = the big card). */
export function FeatureOnHomepage() {
  const { register, watch, formState } = useFormContext<VehicleFormValues>();
  const on = watch("featured");
  const error = formState.errors.featuredOrder?.message;
  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer items-start gap-3 text-foreground">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[#ffd400]" {...register("featured")} />
        <span className="flex flex-col gap-1">
          <span className="text-sm leading-5 font-medium">Feature on homepage</span>
          <span className="text-xs leading-4 text-text-70">
            Shows this car in the homepage search block, ahead of the newest cars. Only cars for sale that are published
            and available appear there.
          </span>
        </span>
      </label>
      {on ? (
        <div className="grid gap-x-8 sm:grid-cols-2">
          <TextField name="featuredOrder" label="Position" placeholder="1 is the big card" inputMode="numeric" />
          {error ? null : (
            <p className="self-end pb-3 text-xs text-text-70">
              Lower numbers come first. Leave empty to go after the numbered ones.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
