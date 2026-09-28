import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/require-session";

export async function GET() {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const templates = await prisma.messageTemplate.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { title, content } = await request.json();
  if (!title || !content) {
    return NextResponse.json(
      { error: "제목과 내용은 필수입니다." },
      { status: 400 }
    );
  }

  const template = await prisma.messageTemplate.create({
    data: { title, content },
  });
  return NextResponse.json(template, { status: 201 });
}
