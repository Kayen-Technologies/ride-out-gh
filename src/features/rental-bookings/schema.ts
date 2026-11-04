import { z } from "zod";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** "Add rental booking" (Figma 120:6889). Email and phone are extra: a customer record needs a way to reach them. */
export const newBookingSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter the customer's name.").max(100, "That name is too long."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Enter the customer's email.")
      .max(254)
      .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) =>
          v === "" ||
          (/^\+?[\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 8 && v.replace(/\D/g, "").length <= 15),
        "Enter a valid phone number.",
      ),
    vehicleId: z.string().regex(/^[0-9a-f-]{36}$/i, "Choose a vehicle."),
    pickupDate: z.string().regex(isoDate, "Choose the pickup date."),
    returnDate: z.string().regex(isoDate, "Choose the return date."),
    pickupLocation: z.string().trim().max(120).optional().default(""),
    dailyRate: z.coerce
      .number({ message: "Enter the agreed daily rate." })
      .positive("Enter the agreed daily rate.")
      .max(1_000_000, "That rate is too high."),
    notes: z.string().trim().max(2000, "Keep notes under 2,000 characters.").optional().default(""),
  })
  .refine((v) => v.returnDate > v.pickupDate, { path: ["returnDate"], message: "Return date must be after pickup." });

export type NewBookingInput = z.input<typeof newBookingSchema>;

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CreateResult =
  { ok: true; id: string; code: string } | { ok: false; error: string; fields?: Record<string, string> };
