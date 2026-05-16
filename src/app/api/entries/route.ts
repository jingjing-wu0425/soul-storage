import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { entryCreateSchema } from "@/lib/validators";
import { generateExcerpt } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const payload = await getCurrentUser();
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;

    const where: Record<string, unknown> = { userId: payload.sub };
    if (status) where.status = status;

    const [entries, total] = await Promise.all([
      prisma.entry.findMany({
        where,
        orderBy: { entryDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { images: { orderBy: { order: "asc" } }, musicAnchors: true },
      }),
      prisma.entry.count({ where }),
    ]);

    return NextResponse.json({ entries, total, page, limit });
  } catch {
    return NextResponse.json({ error: "获取条目失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getCurrentUser();
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const body = await request.json();
    const data = entryCreateSchema.parse(body);

    const entry = await prisma.entry.create({
      data: {
        userId: payload.sub,
        title: data.title,
        content: data.content,
        excerpt: generateExcerpt(data.content),
        mood: data.mood ?? null,
        location: data.location ?? null,
        ambientSound: data.ambientSound ?? null,
        weather: data.weather ?? null,
        visibility: data.visibility || "private",
        status: data.status || "draft",
      },
      include: { images: true, musicAnchors: true },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return NextResponse.json(
        { error: (err as { issues: { message: string }[] }).issues[0]?.message || "验证失败" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "创建条目失败" }, { status: 500 });
  }
}
