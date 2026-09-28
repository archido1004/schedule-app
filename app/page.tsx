import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  currentMonthKey,
  dateKeyToUTCDate,
  formatCurrency,
  todayKeyKST,
  weekdayLabel,
} from "@/lib/format";

export const dynamic = "force-dynamic";

function dotColor(method?: "CASH" | "CARD") {
  if (method === "CASH") return "bg-blue-500";
  if (method === "CARD") return "bg-green-500";
  return "bg-neutral-300";
}

export default async function DashboardPage() {
  const todayKey = todayKeyKST();
  const todayDate = dateKeyToUTCDate(todayKey);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);

  const [todaySchedules, todayRangeEvents, monthEntries] = await Promise.all([
    prisma.schedule.findMany({
      where: { date: todayDate, endDate: null },
      orderBy: { startTime: "asc" },
    }),
    prisma.schedule.findMany({
      where: { date: { lte: todayDate }, endDate: { gte: todayDate } },
    }),
    prisma.salesEntry.findMany({
      where: {
        date: {
          gte: dateKeyToUTCDate(`${currentMonthKey()}-01`),
          lt: tomorrowDate,
        },
      },
    }),
  ]);

  const methodByScheduleId: Record<string, "CASH" | "CARD"> = {};
  for (const entry of monthEntries) {
    if (entry.scheduleId) {
      methodByScheduleId[entry.scheduleId] = entry.method as "CASH" | "CARD";
    }
  }

  const totals = monthEntries.reduce(
    (acc, entry) => {
      if (entry.method === "CASH") acc.cash += entry.amount;
      else acc.card += entry.amount;
      return acc;
    },
    { cash: 0, card: 0 }
  );

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        일정
      </h1>
      <p className="mt-0.5 text-sm text-neutral-400">
        오늘 {todayKey.slice(5)} {weekdayLabel(todayKey)}도 좋은 하루 되세요
        :)
      </p>

      <hr className="mt-4 border-neutral-200" />

      <section className="mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {todayRangeEvents.length === 0 && todaySchedules.length === 0 ? (
          <p className="p-4 text-sm text-neutral-400">
            오늘 등록된 일정이 없습니다.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {todayRangeEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/schedule/${ev.id}`}
                className="flex items-center gap-2.5 bg-blue-50/50 px-3.5 py-2.5 text-sm transition-colors hover:bg-blue-100/60"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">
                  {ev.customerName}
                </span>
                <span className="shrink-0 text-xs font-medium text-blue-500">
                  종일
                </span>
                <span className="shrink-0 text-neutral-300">›</span>
              </Link>
            ))}
            {todaySchedules.map((s) => (
              <Link
                key={s.id}
                href={`/schedule/${s.id}`}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-neutral-50"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${dotColor(
                    methodByScheduleId[s.id]
                  )}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-800">
                    {s.customerName}
                  </p>
                  {s.memo && (
                    <p className="truncate text-xs text-neutral-400">
                      {s.memo}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {s.startTime}
                </span>
                <span className="shrink-0 text-neutral-300">›</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/schedule/new"
        className="mt-3 block rounded-2xl border border-dashed border-neutral-300 p-3 text-center text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
      >
        + 일정 등록
      </Link>

      <h2 className="mt-8 text-lg font-bold text-neutral-900">
        이번 달 매출
      </h2>
      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> 현금
          </p>
          <p className="mt-1 text-xl font-bold text-neutral-900">
            {formatCurrency(totals.cash)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <span className="h-2 w-2 rounded-full bg-green-500" /> 카드
          </p>
          <p className="mt-1 text-xl font-bold text-neutral-900">
            {formatCurrency(totals.card)}
          </p>
        </div>
      </section>
      <Link
        href="/sales"
        className="mt-3 block rounded-2xl border border-dashed border-neutral-300 p-3 text-center text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
      >
        매출 자세히 보기
      </Link>
    </main>
  );
}
