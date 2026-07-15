import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const roleCookie = request.cookies.get("user_role")?.value;
  const url = request.nextUrl.clone();
  const path = request.nextUrl.pathname;

  const roles = ["fan", "volunteer", "security", "operations"];
  for (const role of roles) {
    if (path.startsWith(`/${role}`)) {
      if (!roleCookie || roleCookie !== role) {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/fan/:path*", "/volunteer/:path*", "/security/:path*", "/operations/:path*"],
};
