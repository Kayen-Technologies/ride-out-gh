import { z } from "zod";

export const LISTING_PURPOSES = ["sale", "rent"] as const;
export const VEHICLE_CONDITIONS = ["brand_new", "used"] as const;
export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"] as const;
export const TRANSMISSIONS = ["automatic", "manual"] as const;
export const BODY_TYPES = ["suv", "sedan", "hatchback", "pickup", "other"] as const;

export const IMAGE_CATEGORIES = ["interior", "exterior"] as const;
export type ImageCategory = (typeof IMAGE_CATEGORIES)[number];

/** Most photos per group the wizard accepts. */
export const MAX_IMAGES: Record<ImageCategory, number> = { interior: 6, exterior: 12 };

const money = (message: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d[\d,]*(\.\d{1,2})?$/.test(value), message);

/** Strips thousands separators: "200,000" becomes 200000. Empty text becomes null. */
export function parseMoney(value: string) {
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}

const currentYear = new Date().getFullYear();

/** Fields the database needs even for a draft. */
const basics = {
  name: z.string().trim().min(1, "Enter the vehicle name.").max(120),
  brand: z.string().trim().min(1, "Enter the brand.").max(80),
  model: z.string().trim().min(1, "Enter the model.").max(80),
  year: z
    .string()
    .regex(/^\d{4}$/, "Select the year.")
    .refine((value) => Number(value) >= 1950 && Number(value) <= currentYear + 1, "Select the year."),
  purpose: z.enum(LISTING_PURPOSES),
  condition: z.enum(VEHICLE_CONDITIONS),
};

const details = {
  mileage: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d[\d,]*$/.test(value), "Enter the mileage in km, digits only."),
  exteriorColour: z.string().trim().max(60),
  fuelType: z.enum(FUEL_TYPES, "Select the fuel type."),
  transmission: z.enum(TRANSMISSIONS, "Select the transmission."),
  bodyType: z.enum(BODY_TYPES, "Select the body type."),
  salePrice: money("Enter the price in cedis, for example 200,000."),
  dailyRate: money("Enter the rate in cedis, for example 650."),
  securityDeposit: money("Enter the deposit in cedis, for example 1,000."),
  location: z.string().trim().min(1, "Enter where the vehicle is.").max(120),
  registration: z.string().trim().max(40),
  description: z.string().trim().max(4000),
};

/** Step 1 only, which is also what a draft needs to be saved. */
export const basicInfoSchema = z.object(basics);

/** The whole form, checked when the listing is published or the person moves on from Details. */
export const vehicleFormSchema = z.object({ ...basics, ...details }).superRefine((values, ctx) => {
  if (values.purpose === "sale" && !parseMoney(values.salePrice)) {
    ctx.addIssue({ code: "custom", path: ["salePrice"], message: "Enter the sale price." });
  }
  if (values.purpose === "rent" && !parseMoney(values.dailyRate)) {
    ctx.addIssue({ code: "custom", path: ["dailyRate"], message: "Enter the daily rental rate." });
  }
});

/** What the form holds while it is being filled in: selects start empty, so values are plain strings. */
export type VehicleFormValues = {
  name: string;
  brand: string;
  model: string;
  year: string;
  purpose: (typeof LISTING_PURPOSES)[number];
  condition: (typeof VEHICLE_CONDITIONS)[number];
  mileage: string;
  exteriorColour: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  salePrice: string;
  dailyRate: string;
  securityDeposit: string;
  location: string;
  registration: string;
  description: string;
};

export const defaultVehicleValues: VehicleFormValues = {
  name: "",
  brand: "",
  model: "",
  year: "",
  purpose: "sale",
  condition: "brand_new",
  mileage: "",
  exteriorColour: "",
  fuelType: "petrol",
  transmission: "",
  bodyType: "suv",
  salePrice: "",
  dailyRate: "",
  securityDeposit: "",
  location: "Accra",
  registration: "",
  description: "",
};

export const STEP_FIELDS: Record<1 | 2, (keyof VehicleFormValues)[]> = {
  1: ["name", "brand", "model", "year", "purpose", "condition"],
  2: [
    "mileage",
    "exteriorColour",
    "fuelType",
    "transmission",
    "bodyType",
    "salePrice",
    "dailyRate",
    "securityDeposit",
    "location",
    "registration",
    "description",
  ],
};

export type SavedImage = { path: string; category: ImageCategory };

export const saveVehicleInputSchema = z.object({
  id: z.uuid(),
  intent: z.enum(["draft", "publish"]),
  values: z.looseObject({}),
  images: z
    .array(z.object({ path: z.string().min(1), category: z.enum(IMAGE_CATEGORIES) }))
    .max(MAX_IMAGES.interior + MAX_IMAGES.exterior),
});

export type SaveVehicleInput = {
  id: string;
  intent: "draft" | "publish";
  values: VehicleFormValues;
  images: SavedImage[];
};

export type SaveVehicleResult =
  | { ok: true; id: string; code: string }
  | { ok: false; error: string };
