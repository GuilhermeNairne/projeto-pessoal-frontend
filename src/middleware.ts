import { NextResponse } from "next/server";

export function middleware(req: any) {
  console.log("estou no middleware");
  const token = req.cookies.get("idToken")?.value;
  const routeProtected = req.nextUrl.pathname.startsWith("/financeiro");
  if (routeProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/financeiro/:path*", "/financeiro"],
};
