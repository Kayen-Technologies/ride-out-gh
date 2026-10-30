export type AdminNavLink = { label: string; href: string; iconSrc?: string };

export const adminNavLinks: AdminNavLink[] = [
  { label: "Dashboard", href: "/admin", iconSrc: "/brand/icons/admin-nav-dashboard.svg" },
  { label: "Inventory", href: "/admin/inventory", iconSrc: "/brand/icons/admin-nav-inventory.svg" },
  {
    label: "Vehicle Orders",
    href: "/admin/orders",
    iconSrc: "/brand/icons/admin-nav-vehicle-orders.svg",
  },
  {
    label: "Rental Bookings",
    href: "/admin/rentals",
    iconSrc: "/brand/icons/admin-nav-rental-bookings.svg",
  },
  { label: "Customers", href: "/admin/customers", iconSrc: "/brand/icons/admin-nav-customers.svg" },
  // No Figma nav item — Lucide FileText in nav components until a design exists.
  { label: "Website content", href: "/admin/content" },
  { label: "Settings", href: "/admin/settings", iconSrc: "/brand/icons/admin-nav-settings.svg" },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
