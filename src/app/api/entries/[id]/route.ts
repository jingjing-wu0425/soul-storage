import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { entryUpdateSchema } from "@/lib/validators";
import { generateExcerpt } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { id } = await params;
    const entry = await prisma.entry.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } }, musicAnchors: true },
    });

    if (!entry || entry.userId !== payload.sub) {
      return NextResponse.json({ error: "条目不存在" }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json({ error: "获取条目失败" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== payload.sub) {
      return NextResponse.json({ error: "条目不存在" }, { status: 404 });
    }

    const body = await request.json();
    const data = entryUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.content) updateData.excerpt = generateExcerpt(data.content);

    const entry = await prisma.entry.update({
      where: { id },
      data: updateData,
      include: { images: { orderBy: { order: "asc" } }, musicAnchors: true },
    });

    return NextResponse.json({ entry });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return NextResponse.json(
        { error: (err as { issues: { message: string }[] }).issues[0]?.message || "验证失败" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "更新条目失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.entry.findUnique({ where: { id } });
    if (!existing || existing.userId !== payload.sub) {
      return NextResponse.json({ error: "条目不存在" }, { status: 404 });
    }

    await prisma.entry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "删除条目失败" }, { status: 500 });
  }
}
