import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken, COOKIE_OPTIONS, TOKEN_NAME } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: existing.email === data.email ? "邮箱已被注册" : "用户名已被占用" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
      },
      select: { id: true, username: true, email: true },
    });

    const token = await signToken({ sub: user.id, username: user.username });
    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, COOKIE_OPTIONS);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return NextResponse.json(
        { error: (err as { issues: { message: string }[] }).issues[0]?.message || "输入验证失败" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "注册失败，请稍后再试" }, { status: 500 });
  }
}
