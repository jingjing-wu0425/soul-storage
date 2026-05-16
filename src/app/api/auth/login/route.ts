import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, COOKIE_OPTIONS, TOKEN_NAME } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signToken({ sub: user.id, username: user.username });
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, COOKIE_OPTIONS);

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return NextResponse.json(
        { error: (err as { issues: { message: string }[] }).issues[0]?.message || "输入验证失败" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "登录失败，请稍后再试" }, { status: 500 });
  }
}
