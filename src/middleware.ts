import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ENABLE_I18N = process.env.NEXT_PUBLIC_ENABLE_I18N === "true";

export function middleware(request: NextRequest) {
  // i18n無効時: /en/* → /ja/* に301リダイレクト
  if (!ENABLE_I18N && request.nextUrl.pathname.startsWith("/en")) {
    const newPath = request.nextUrl.pathname.replace(/^\/en/, "/ja");
    const url = request.nextUrl.clone();
    url.pathname = newPath || "/ja";
    return NextResponse.redirect(url, 301);
  }
}

export const config = {
  matcher: ["/en/:path*"],
};
