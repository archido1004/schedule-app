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
    ? { date: { gte: monthRange(month).start, lt: monthRange(month).end } }
    : {};

  const entries = await prisma.salesEntry.findMany({
    where,
    orderBy: { date: "desc" },
  });

  const totals = entries.reduce(
    (acc, entry) => {
      if (entry.method === "CASH") acc.cash += entry.amount;
      else if (entry.method === "CARD") acc.card += entry.amount;
      return acc;
    },
    { cash: 0, card: 0 }
  );

  return NextResponse.json({ entries, totals });
}

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await request.json();
  const { date, amount, method, memo, scheduleId } = body;

  if (!date || typeof amount !== "number" || !["CASH", "CARD"].includes(method)) {
    return NextResponse.json(
      { error: "날짜, 금액, 결제수단(현금/카드)은 필수입니다." },
      { status: 400 }
    );
  }

  const entry = await prisma.salesEntry.create({
    data: {
      date: new Date(date),
      amount,
      method,
      memo: memo || null,
      scheduleId: scheduleId || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
