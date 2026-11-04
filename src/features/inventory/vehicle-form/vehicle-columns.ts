import "server-only";

import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, parseMoney } from "@/features/inventory/vehicle-form/schema";
import type { Database } from "@/lib/supabase/database.types";

type VehicleUpdate = Database["public"]["Tables"]["vehicles"]["Update"];

/**
 * Turns the wizard's text values into the columns the `vehicles` table stores. Lenient on purpose:
 * a draft may hold half-filled fields, so anything that does not parse becomes null rather than an error.
 */
export function buildVehicleColumns(
  values: Record<string, unknown>,
  basics: {
    brand: string;
    model: string;
    year: number;
    purpose: "sale" | "rent";
    condition: "brand_new" | "used";
  },
): VehicleUpdate {
  const text = (key: string) => {
    const value = values[key];
    return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
  };
  const oneOf = <T extends string>(key: string, allowed: readonly T[]) => {
    const value = text(key);
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
  };

  const mileageText = text("mileage")?.replace(/,/g, "") ?? null;
  const salePrice = parseMoney(String(values.salePrice ?? ""));
  const dailyRate = parseMoney(String(values.dailyRate ?? ""));
  const deposit = parseMoney(String(values.securityDeposit ?? ""));
  // Only cars for sale appear in the homepage search block, so a rental is never marked featured.
  const featured = basics.purpose === "sale" && values.featured === true;
  const orderText = String(values.featuredOrder ?? "").trim();

  return {
    listing_purpose: basics.purpose,
    brand: basics.brand,
    model: basics.model,
    year: basics.year,
    condition: basics.condition,
    body_type: oneOf("bodyType", BODY_TYPES),
    transmission: oneOf("transmission", TRANSMISSIONS),
    fuel_type: oneOf("fuelType", FUEL_TYPES),
    exterior_colour: text("exteriorColour"),
    mileage_km: mileageText && /^\d+$/.test(mileageText) ? Number(mileageText) : null,
    registration: text("registration"),
    location: text("location"),
    description: text("description"),
    sale_price: basics.purpose === "sale" ? salePrice : null,
    rental_daily_rate: basics.purpose === "rent" ? dailyRate : null,
    rental_security_deposit: basics.purpose === "rent" ? deposit : null,
    is_featured: featured,
    featured_order: featured && /^\d{1,3}$/.test(orderText) ? Number(orderText) : null,
  };
}
