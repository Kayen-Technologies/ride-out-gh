import { z } from "zod";

/** Letters, digits and the usual separators; 8 to 15 digits, so "+233 57 078 6961" and "0570786961" both pass. */
const phone = z
  .string()
  .trim()
  .min(1, "Enter your phone or WhatsApp number.")
  .refine(
    (v) => /^\+?[\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 8 && v.replace(/\D/g, "").length <= 15,
    "Enter a valid phone number.",
  );

/** Ghana Card numbers look like GHA-123456789-0. Accepts it typed without dashes or in lower case. */
export const GHANA_CARD = /^GHA-?(\d{9})-?(\d)$/i;

export const requestFieldsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100, "That name is too long."),
  phone,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Enter your email address.")
    .max(254)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email address."),
  ghanaCardNumber: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || GHANA_CARD.test(v.replace(/\s/g, "")), "Use the format GHA-123456789-0."),
});

export type RequestFields = z.infer<typeof requestFieldsSchema>;

export type RequestResult =
  | { ok: true; code: string }
  | { ok: false; error: string; fields?: Partial<Record<keyof RequestFields | "ghanaCardImage", string>> };

export const CARD_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** Photos are shrunk in the browser first; this is the most the server accepts. */
export const CARD_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
