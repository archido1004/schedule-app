import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentMonthKey, dateKeyToUTCDate, todayKeyKST } from "@/lib/format";
import { ScheduleView } from "@/components/ScheduleView";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthKey = month || currentMonthKey();

  const start = dateKeyToUTCDate(`${monthKey}-01`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

  const [schedules, salesEntries] = await Promise.all([
    prisma.schedule.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.salesEntry.findMany({
      where: { date: { gte: start, lt: end } },
    }),
  ]);

  const schedulesByDate: Record<
    string,
    { id: string; customerName: string; startTime: string }[]
  > = {};
  for (const s of schedules) {
    const key = s.date.toISOString().slice(0, 10);
    (schedulesByDate[key] ??= []).push({
      id: s.id,
      customerName: s.customerName,
      startTime: s.startTime,
    });
  }

  const revenueByDate: Record<string, number> = {};
  for (const entry of salesEntries) {
    const key = entry.date.toISOString().slice(0, 10);
    revenueByDate[key] = (revenueByDate[key] ?? 0) + entry.amount;
  }

  const sortedDateKeys = Object.keys(schedulesByDate).sort();

  const [year, mon] = monthKey.split("-").map(Number);
  const prevMonth = new Date(Date.UTC(year, mon - 2, 1))
    .toISOString()
    .slice(0, 7);
  const nextMonth = new Date(Date.UTC(year, mon, 1))
    .toISOString()
    .slice(0, 7);

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/schedule?month=${prevMonth}`}
          className="rounded-md px-2 py-1 text-sm text-neutral-500"
        >
          ← 이전달
        </Link>
        <h1 className="text-lg font-semibold">{monthKey}</h1>
        <Link
          href={`/schedule?month=${nextMonth}`}
          className="rounded-md px-2 py-1 text-sm text-neutral-500"
        >
          다음달 →
        </Link>
      </div>

      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        일정을 등록하면 그 시간 전후 1시간은 네이버예약에서도 직접
        예약불가 처리해두세요. (자동 연동은 아직 준비 중입니다)
      </div>

      <div className="mt-4">
        <ScheduleView
          monthKey={monthKey}
          todayKey={todayKeyKST()}
          schedulesByDate={schedulesByDate}
          revenueByDate={revenueByDate}
          sortedDateKeys={sortedDateKeys}
        />
      </div>

      <Link
        href="/schedule/new"
        className="fixed bottom-6 right-4 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
      >
        + 일정 등록
      </Link>
    </main>
  );
}
