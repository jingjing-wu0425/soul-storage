import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const entries = await prisma.experienceEntry.findMany({
      orderBy: [{ sectionId: "asc" }, { order: "asc" }],
    });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = await prisma.experienceEntry.create({ data: body });
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
