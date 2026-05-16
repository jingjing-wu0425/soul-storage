import { NextResponse } from "next/server";
import { TOKEN_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, "", { maxAge: 0, path: "/" });
  return NextResponse.json({ ok: true });
}
