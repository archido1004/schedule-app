import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/require-session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json();
  const { date, amount, method, memo } = body;

  const entry = await prisma.salesEntry.update({
    where: { id },
    data: {
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(amount !== undefined ? { amount } : {}),
      ...(method !== undefined ? { method } : {}),
      ...(memo !== undefined ? { memo: memo || null } : {}),
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await prisma.salesEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
