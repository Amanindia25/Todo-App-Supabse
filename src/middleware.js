import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session;
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth");

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/tododashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/auth/:path*", "/tododashboard"],
};
