import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  console.log(session);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (
    session.user.email_confirmed_at &&
    session.user.email_confirmed_at !== null
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return res;
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|home).*)",
};
