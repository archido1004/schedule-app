import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/require-session";

function monthRange(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1));
  const end = new Date(Date.UTC(year, mon, 1));
  return { start, end };
}

export async function GET(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  const where = month
    ? {
        date: { lt: monthRange(month).end },
        OR: [
          { endDate: null, date: { gte: monthRange(month).start } },
          { endDate: { gte: monthRange(month).start } },
        ],
      }
    : {};

  const schedules = await prisma.schedule.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { date, endDate, startTime, endTime, customerName, customerPhone, memo } = body;

  if (!date || !startTime || !endTime || !customerName) {
    return NextResponse.json(
      { error: "날짜, 시작/종료 시간, 고객명은 필수입니다." },
      { status: 400 }
    );
  }

  const schedule = await prisma.schedule.create({
    data: {
      date: new Date(date),
      endDate: endDate && endDate !== date ? new Date(endDate) : null,
      startTime,
      endTime,
      customerName,
      customerPhone: customerPhone || null,
      memo: memo || null,
    },
  });

  return NextResponse.json(schedule, { status: 201 });
}
