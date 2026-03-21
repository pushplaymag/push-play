import { NextRequest, NextResponse } from "next/server";

function detectLocale(req: NextRequest): string {
  const accept = req.headers.get("accept-language") ?? "";
  const primary = accept.split(",")[0]?.split(";")[0]?.trim().toLowerCase() ?? "en";
  if (primary.startsWith("ko")) return "ko";
  if (primary.startsWith("ja")) return "ja";
  return "en";
}

export function middleware(req: NextRequest) {
  const locale = detectLocale(req);
  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|uploads|favicon|icons).*)"],
};
