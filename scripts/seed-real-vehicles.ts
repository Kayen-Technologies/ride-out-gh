/**
 * Loads realistic demo vehicles WITH photos into the dev project.
 *
 * It follows the same rules as the Add Vehicle form: values are checked with the form's zod schema, mapped
 * to columns with the same helper, and photos are resized to a 2000 px long edge, saved as WebP and stored
 * under vehicle-images/<vehicle id>/<exterior|interior>/, with the first exterior photo as the cover.
 *
 *   MOCK_PHOTOS_DIR=/path/to/dir npx tsx --conditions=react-server scripts/seed-real-vehicles.ts
 *
 * The directory holds `final.json` ({ <key>: [{ file, category }] }) and the photo files it points to.
 * Photos came from Wikimedia Commons under free licences; see docs/mock-photo-credits.md. They are for
 * development only. Replace them with the client's own photos before launch.
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

import { buildVehicleColumns } from "../src/features/inventory/vehicle-form/vehicle-columns.ts";
import { basicInfoSchema, vehicleFormSchema } from "../src/features/inventory/vehicle-form/schema.ts";
import type { Database } from "../src/lib/supabase/database.types.ts";

const DEV_PROJECT_REF = "bqpnweyznvijtmwsctwj";
const SKIP = new Set((process.env.SKIP_KEYS ?? "").split(",").filter(Boolean));

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);
if (!env.NEXT_PUBLIC_SUPABASE_URL?.includes(DEV_PROJECT_REF)) {
  console.error(`refusing to seed: URL must contain ${DEV_PROJECT_REF}`);
  process.exit(1);
}
const photosDir = process.env.MOCK_PHOTOS_DIR;
if (!photosDir) {
  console.error("set MOCK_PHOTOS_DIR");
  process.exit(1);
}

const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

type Availability = Database["public"]["Enums"]["availability_status"];
type Listing = Database["public"]["Enums"]["listing_status"];

type Car = {
  key: string;
  listing: Listing;
  availability: Availability;
  values: Record<string, string>;
};

const base = { exteriorColour: "", mileage: "", fuelType: "petrol", transmission: "automatic", bodyType: "suv", salePrice: "", dailyRate: "", securityDeposit: "", location: "Accra", registration: "", description: "" };

const cars: Car[] = [
  {
    key: "camry", listing: "published", availability: "available",
    values: { ...base, name: "2019 Toyota Camry", brand: "Toyota", model: "Camry", year: "2019", purpose: "sale", condition: "used", bodyType: "sedan", mileage: "48000", exteriorColour: "Black", salePrice: "135,000", location: "Tema", registration: "GT 3344-20", description: "Smooth, comfortable 2019 Toyota Camry with leather seats and a reverse camera. Regularly serviced, clean title, ready for a new owner." },
  },
  {
    key: "rav4", listing: "published", availability: "available",
    values: { ...base, name: "2022 Toyota RAV4 Hybrid", brand: "Toyota", model: "RAV4 Hybrid", year: "2022", purpose: "sale", condition: "used", fuelType: "hybrid", mileage: "12000", exteriorColour: "Red", salePrice: "245,000", registration: "GR 9012-22", description: "Low-mileage RAV4 Hybrid with excellent fuel economy, adaptive cruise control and a full safety suite. One careful owner." },
  },
  {
    key: "prado", listing: "published", availability: "booked",
    values: { ...base, name: "2020 Toyota Land Cruiser Prado", brand: "Toyota", model: "Land Cruiser Prado", year: "2020", purpose: "sale", condition: "used", fuelType: "diesel", mileage: "38500", exteriorColour: "White", salePrice: "420,000", registration: "GN 7788-20", description: "Go-anywhere Prado TX-L with seven seats, sunroof and a full leather interior. Reserved for a customer; enquire to join the waiting list." },
  },
  {
    key: "crv", listing: "published", availability: "available",
    values: { ...base, name: "2023 Honda CR-V", brand: "Honda", model: "CR-V", year: "2023", purpose: "sale", condition: "brand_new", mileage: "150", exteriorColour: "Grey", salePrice: "265,000", location: "Tema", description: "Brand new 2023 Honda CR-V with the full Honda Sensing package, a spacious cabin and a large boot. Delivered with a manufacturer warranty." },
  },
  {
    key: "cclass", listing: "hidden", availability: "available",
    values: { ...base, name: "2019 Mercedes-Benz C-Class", brand: "Mercedes-Benz", model: "C 200", year: "2019", purpose: "sale", condition: "used", bodyType: "sedan", mileage: "41000", exteriorColour: "Dark blue", salePrice: "310,000", registration: "GR 5521-19", description: "Elegant C 200 in deep blue with AMG Line trim, ambient lighting and a panoramic roof. Temporarily hidden while photos are retaken." },
  },
  {
    key: "x5", listing: "published", availability: "sold",
    values: { ...base, name: "2020 BMW X5 xDrive40i", brand: "BMW", model: "X5 xDrive40i", year: "2020", purpose: "sale", condition: "used", mileage: "29000", exteriorColour: "Grey", salePrice: "520,000", registration: "GW 1180-20", description: "Powerful and refined X5 with the M Sport package, head-up display and a panoramic roof. Sold, shown for reference." },
  },
  {
    key: "navara", listing: "draft", availability: "available",
    values: { ...base, name: "2021 Nissan Navara", brand: "Nissan", model: "Navara", year: "2021", purpose: "sale", condition: "used", fuelType: "diesel", bodyType: "pickup", mileage: "56000", exteriorColour: "White", salePrice: "178,000", location: "Kumasi", registration: "AS 2290-21", description: "Tough double-cab Navara, 4x4 with a hard tonneau cover. Draft: waiting on service records before it goes live." },
  },
  {
    key: "sportage", listing: "published", availability: "booked",
    values: { ...base, name: "2023 Kia Sportage", brand: "Kia", model: "Sportage", year: "2023", purpose: "rent", condition: "used", mileage: "11500", exteriorColour: "Grey", dailyRate: "600", securityDeposit: "1,000", registration: "GT 4410-23", description: "Modern Kia Sportage with a big touchscreen, wireless charging and generous boot space. Popular for weekend trips. Currently booked." },
  },
  {
    key: "polo", listing: "published", availability: "available",
    values: { ...base, name: "2022 Volkswagen Polo", brand: "Volkswagen", model: "Polo", year: "2022", purpose: "rent", condition: "used", bodyType: "hatchback", mileage: "19000", exteriorColour: "White", dailyRate: "380", securityDeposit: "800", location: "Tema", registration: "GN 6602-22", description: "Compact, efficient Polo that is easy to park and cheap to run. A smart choice for city driving and short business trips." },
  },
  {
    key: "hilux", listing: "published", availability: "under_maintenance",
    values: { ...base, name: "2022 Toyota Hilux Double Cab", brand: "Toyota", model: "Hilux Double Cab", year: "2022", purpose: "rent", condition: "used", fuelType: "diesel", transmission: "manual", bodyType: "pickup", mileage: "34000", exteriorColour: "White", dailyRate: "550", securityDeposit: "1,500", location: "Kumasi", registration: "AS 8830-22", description: "Reliable 4x4 Hilux for site work and long-distance travel. In the workshop for routine servicing; back on the road soon." },
  },
];

async function adminUserId() {
  const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data?.users.find((user) => user.email === "admin@rideout.com")?.id ?? null;
}

async function main() {
  const manifest = JSON.parse(readFileSync(path.join(photosDir!, "final.json"), "utf8")) as Record<
    string,
    { file: string; category: "interior" | "exterior" }[]
  >;
  const createdBy = await adminUserId();

  for (const car of cars) {
    if (SKIP.has(car.key)) continue;
    const parsed = (car.listing === "published" ? vehicleFormSchema : basicInfoSchema).safeParse(car.values);
    if (!parsed.success) throw new Error(`${car.key}: ${parsed.error.issues[0]?.message}`);
    const year = Number(car.values.year);
    const columns = buildVehicleColumns(car.values, {
      brand: car.values.brand,
      model: car.values.model,
      year,
      purpose: car.values.purpose as "sale" | "rent",
      condition: car.values.condition as "brand_new" | "used",
    });

    const id = randomUUID();
    const slug = `${[year, car.values.brand, car.values.model].join(" ").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${id.slice(0, 6)}`;
    const { error } = await supabase.from("vehicles").insert({
      ...columns,
      id,
      slug,
      listing_status: car.listing,
      availability_status: car.availability,
      published_at: car.listing === "draft" ? null : new Date().toISOString(),
      created_by: createdBy,
      brand: car.values.brand,
      model: car.values.model,
      year,
      condition: car.values.condition as "brand_new" | "used",
      listing_purpose: car.values.purpose as "sale" | "rent",
    });
    if (error) throw new Error(`${car.key}: ${error.message}`);

    const photos = manifest[car.key] ?? [];
    const ordered = [...photos.filter((p) => p.category === "exterior"), ...photos.filter((p) => p.category === "interior")];
    const rows: { vehicle_id: string; storage_path: string; sort_order: number; is_cover: boolean }[] = [];
    for (const [index, photo] of ordered.entries()) {
      const buffer = await sharp(path.join(photosDir!, photo.file))
        .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      const storagePath = `${id}/${photo.category}/${randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("vehicle-images")
        .upload(storagePath, buffer, { contentType: "image/webp" });
      if (uploadError) throw new Error(`${car.key}: ${uploadError.message}`);
      rows.push({ vehicle_id: id, storage_path: storagePath, sort_order: index, is_cover: index === 0 });
    }
    if (rows.length) {
      const { error: imageError } = await supabase.from("vehicle_images").insert(rows);
      if (imageError) throw new Error(`${car.key}: ${imageError.message}`);
    }
    console.log(`added ${car.values.name} (${car.listing}, ${car.availability}) with ${rows.length} photos`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
