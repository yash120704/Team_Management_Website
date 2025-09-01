import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token"); // Supabase stores session here

  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Optionally, specify which paths to run the middleware on
export const config = {
  matcher: ["/dashboard/:path*"]
};
