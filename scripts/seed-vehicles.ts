import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../src/lib/supabase/database.types.ts";

type VehicleInsert = Database["public"]["Tables"]["vehicles"]["Insert"];

const DEV_PROJECT_REF = "bqpnweyznvijtmwsctwj";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error("missing supabase env");
  process.exit(1);
}

if (!url.includes(DEV_PROJECT_REF)) {
  console.error(`refusing to seed: URL must contain ${DEV_PROJECT_REF}`);
  process.exit(1);
}

const supabase = createClient<Database>(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const vehicles: VehicleInsert[] = [
  {
    slug: "2022-toyota-land-cruiser-prado",
    brand: "Toyota",
    model: "Land Cruiser Prado",
    year: 2022,
    listing_purpose: "sale",
    listing_status: "published",
    availability_status: "available",
    condition: "used",
    body_type: "suv",
    transmission: "automatic",
    fuel_type: "petrol",
    sale_price: 185_000,
    seller_name: "Kwame Mensah",
    registration: "GR-2345-22",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2023-hyundai-tucson-rent",
    brand: "Hyundai",
    model: "Tucson",
    year: 2023,
    listing_purpose: "rent",
    listing_status: "published",
    availability_status: "available",
    condition: "used",
    body_type: "suv",
    transmission: "automatic",
    fuel_type: "petrol",
    rental_daily_rate: 650,
    seller_name: "Kwame Mensah",
    registration: "GR-8821-23",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2024-kia-sportage-rent",
    brand: "Kia",
    model: "Sportage",
    year: 2024,
    listing_purpose: "rent",
    listing_status: "published",
    availability_status: "booked",
    condition: "used",
    body_type: "suv",
    transmission: "automatic",
    fuel_type: "petrol",
    rental_daily_rate: 600,
    seller_name: "Kwame Mensah",
    registration: "GR-4410-24",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2021-toyota-corolla-rent",
    brand: "Toyota",
    model: "Corolla",
    year: 2021,
    listing_purpose: "rent",
    listing_status: "published",
    availability_status: "rented",
    condition: "used",
    body_type: "sedan",
    transmission: "automatic",
    fuel_type: "petrol",
    rental_daily_rate: 450,
    seller_name: "Kwame Mensah",
    registration: "GR-1190-21",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2020-honda-civic-sale",
    brand: "Honda",
    model: "Civic",
    year: 2020,
    listing_purpose: "sale",
    listing_status: "published",
    availability_status: "sold",
    condition: "used",
    body_type: "sedan",
    sale_price: 95_000,
    seller_name: "Kwame Mensah",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2019-nissan-navara-sale",
    brand: "Nissan",
    model: "Navara",
    year: 2019,
    listing_purpose: "sale",
    listing_status: "hidden",
    availability_status: "available",
    condition: "used",
    body_type: "pickup",
    sale_price: 120_000,
    seller_name: "Kwame Mensah",
  },
  {
    slug: "2022-mercedes-c-class-draft",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2022,
    listing_purpose: "sale",
    listing_status: "draft",
    availability_status: "available",
    condition: "used",
    body_type: "sedan",
    sale_price: 210_000,
    seller_name: "Ride-Out",
  },
  {
    slug: "2023-toyota-hilux-maintenance",
    brand: "Toyota",
    model: "Hilux",
    year: 2023,
    listing_purpose: "rent",
    listing_status: "published",
    availability_status: "under_maintenance",
    condition: "used",
    body_type: "pickup",
    rental_daily_rate: 550,
    seller_name: "Kwame Mensah",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2018-ford-explorer-unavailable",
    brand: "Ford",
    model: "Explorer",
    year: 2018,
    listing_purpose: "sale",
    listing_status: "published",
    availability_status: "unavailable",
    condition: "used",
    body_type: "suv",
    sale_price: 88_000,
    seller_name: "Ride-Out",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2021-bmw-x5-sale",
    brand: "BMW",
    model: "X5",
    year: 2021,
    listing_purpose: "sale",
    listing_status: "published",
    availability_status: "available",
    condition: "used",
    body_type: "suv",
    sale_price: 320_000,
    seller_name: "Kwame Mensah",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2022-volkswagen-polo-rent",
    brand: "Volkswagen",
    model: "Polo",
    year: 2022,
    listing_purpose: "rent",
    listing_status: "published",
    availability_status: "available",
    condition: "used",
    body_type: "hatchback",
    rental_daily_rate: 380,
    seller_name: "Ride-Out",
    published_at: new Date().toISOString(),
  },
  {
    slug: "2020-mazda-cx5-hidden-rent",
    brand: "Mazda",
    model: "CX-5",
    year: 2020,
    listing_purpose: "rent",
    listing_status: "hidden",
    availability_status: "available",
    condition: "used",
    body_type: "suv",
    rental_daily_rate: 520,
    seller_name: "Kwame Mensah",
  },
  {
    slug: "2017-toyota-camry-draft-sale",
    brand: "Toyota",
    model: "Camry",
    year: 2017,
    listing_purpose: "sale",
    listing_status: "draft",
    availability_status: "booked",
    condition: "used",
    body_type: "sedan",
    sale_price: 72_000,
    seller_name: "Ride-Out",
  },
  {
    slug: "2024-byddolphin-sale",
    brand: "BYD",
    model: "Dolphin",
    year: 2024,
    listing_purpose: "sale",
    listing_status: "published",
    availability_status: "available",
    condition: "brand_new",
    body_type: "hatchback",
    sale_price: 145_000,
    seller_name: "Kwame Mensah",
    published_at: new Date().toISOString(),
  },
];

async function main() {
  for (const vehicle of vehicles) {
    const { error } = await supabase.from("vehicles").upsert(vehicle, { onConflict: "slug" });
    if (error) {
      console.error(vehicle.slug, error.message);
      process.exit(1);
    }
    console.log(`upserted ${vehicle.slug}`);
  }
  console.log(`done: ${vehicles.length} vehicles`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
