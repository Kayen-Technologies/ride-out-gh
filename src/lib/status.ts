import type { Database } from "@/lib/supabase/database.types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type RentalStatus = Database["public"]["Enums"]["rental_status"];
type OrderService = Database["public"]["Enums"]["order_service_type"];

export type OrderAdminTab = "new" | "active" | "completed" | "all";
export type RentalAdminTab = "new" | "upcoming" | "active" | "past" | "all";

type Step<Status extends string, Tab extends string> = {
  status: Status;
  label: string;
  adminTab: Tab;
};

// TODO(Q20): Figma names the tabs but does not say which status sits in which one.
const importOrderSteps = [
  { status: "enquiry", label: "Enquiry", adminTab: "new" },
  { status: "reviewing", label: "Reviewing", adminTab: "active" },
  { status: "confirmed", label: "Confirmed", adminTab: "active" },
  { status: "sourcing", label: "Sourcing", adminTab: "active" },
  { status: "purchased", label: "Purchased", adminTab: "active" },
  { status: "in_transit", label: "In transit", adminTab: "active" },
  { status: "customs_clearance", label: "Customs clearance", adminTab: "active" },
  { status: "delivered", label: "Delivered", adminTab: "completed" },
] as const satisfies readonly Step<OrderStatus, OrderAdminTab>[];

const listingOrderSteps = [
  { status: "inquiry_received", label: "Inquiry received", adminTab: "new" },
  { status: "availability_confirmed", label: "Availability confirmed", adminTab: "active" },
  { status: "purchase_arrangements", label: "Purchase arrangements", adminTab: "active" },
  { status: "vehicle_handover", label: "Vehicle handover", adminTab: "completed" },
] as const satisfies readonly Step<OrderStatus, OrderAdminTab>[];

const rentalSteps = [
  { status: "inquiry_received", label: "Inquiry received", adminTab: "new" },
  { status: "confirmed", label: "Confirmed", adminTab: "upcoming" },
  { status: "ready_for_pickup", label: "Ready to pickup", adminTab: "upcoming" },
  { status: "active", label: "Active rental", adminTab: "active" },
  { status: "returned", label: "Returned", adminTab: "past" },
] as const satisfies readonly Step<RentalStatus, RentalAdminTab>[];

const cancelledLabel = "Cancelled";

export function orderSteps(service: OrderService) {
  return service === "listing_purchase" ? listingOrderSteps : importOrderSteps;
}

export function rentalStepList() {
  return rentalSteps;
}

export function orderLabel(status: OrderStatus) {
  if (status === "cancelled") return cancelledLabel;
  return [...importOrderSteps, ...listingOrderSteps].find((step) => step.status === status)?.label ?? status;
}

export function rentalLabel(status: RentalStatus) {
  if (status === "cancelled") return cancelledLabel;
  return rentalSteps.find((step) => step.status === status)?.label ?? status;
}

export function orderAdminTab(status: OrderStatus): OrderAdminTab {
  if (status === "cancelled") return "all";
  return [...importOrderSteps, ...listingOrderSteps].find((step) => step.status === status)?.adminTab ?? "all";
}

export function rentalAdminTab(status: RentalStatus): RentalAdminTab {
  if (status === "cancelled") return "past";
  return rentalSteps.find((step) => step.status === status)?.adminTab ?? "all";
}

export function orderStepIndex(service: OrderService, status: OrderStatus) {
  if (status === "cancelled") return -1;
  return orderSteps(service).findIndex((step) => step.status === status);
}

export function rentalStepIndex(status: RentalStatus) {
  if (status === "cancelled") return -1;
  return rentalSteps.findIndex((step) => step.status === status);
}
