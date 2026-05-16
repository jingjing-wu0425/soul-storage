import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await prisma.portfolioProject.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project = await prisma.portfolioProject.create({ data: body });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
