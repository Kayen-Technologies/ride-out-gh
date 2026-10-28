import { NextResponse, type NextRequest } from "next/server";

import { isStaffRole } from "@/lib/staff";
import { refreshSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, supabase, userId } = await refreshSession(request);
  const { pathname } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAccount = pathname === "/account" || pathname.startsWith("/account/");

  if (!isAdmin && !isAccount) return response;

  if (!supabase || !userId) return redirectTo(request, "/login", response);
  if (!isAdmin) return response;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = profile && typeof profile.role === "string" ? profile.role : null;
  if (error || !isStaffRole(role)) return redirectTo(request, "/", response);

  return response;
}

function redirectTo(request: NextRequest, pathname: string, response: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
