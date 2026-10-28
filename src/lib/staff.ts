export function isStaffRole(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}
