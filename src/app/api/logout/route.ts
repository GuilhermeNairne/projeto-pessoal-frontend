import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("access_token", "", { maxAge: -1 });
  res.cookies.set("id_token", "", { maxAge: -1 });
  res.cookies.set("idToken", "", { maxAge: -1 });
  res.cookies.set("refresh_token", "", { maxAge: -1 });
  res.cookies.set("auth_session", "", { maxAge: -1 });

  return res;
}
