import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/require-session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule) {
    return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(schedule);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const { date, startTime, endTime, customerName, customerPhone, memo } = body;

  const schedule = await prisma.schedule.update({
    where: { id },
    data: {
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(startTime !== undefined ? { startTime } : {}),
      ...(endTime !== undefined ? { endTime } : {}),
      ...(customerName !== undefined ? { customerName } : {}),
      ...(customerPhone !== undefined ? { customerPhone: customerPhone || null } : {}),
      ...(memo !== undefined ? { memo: memo || null } : {}),
    },
  });

  return NextResponse.json(schedule);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.schedule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
