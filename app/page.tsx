import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  currentMonthKey,
  dateKeyToUTCDate,
  formatCurrency,
  todayKeyKST,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const todayKey = todayKeyKST();
  const todayDate = dateKeyToUTCDate(todayKey);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);

  const [todaySchedules, monthEntries] = await Promise.all([
    prisma.schedule.findMany({
      where: { date: { gte: todayDate, lt: tomorrowDate } },
      orderBy: { startTime: "asc" },
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
      <h1 className="text-lg font-semibold">오늘 ({todayKey})</h1>

      <section className="mt-3 flex flex-col gap-2">
        {todaySchedules.length === 0 ? (
          <p className="rounded-lg bg-white p-4 text-sm text-neutral-500 shadow-sm">
            오늘 등록된 일정이 없습니다.
          </p>
        ) : (
          todaySchedules.map((s) => (
            <Link
              key={s.id}
              href={`/schedule/${s.id}`}
              className="block rounded-lg border-l-4 border-l-indigo-500 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate font-medium">
                  {s.customerName}
                </span>
                <span className="shrink-0 text-sm text-neutral-500">
                  {s.startTime}
                </span>
              </div>
              {s.memo && (
                <p className="mt-1 truncate text-sm text-neutral-500">
                  {s.memo}
                </p>
              )}
            </Link>
          ))
        )}
        <Link
          href="/schedule/new"
          className="rounded-lg border border-dashed border-neutral-300 p-3 text-center text-sm text-neutral-600"
        >
          + 일정 등록
        </Link>
      </section>

      <h2 className="mt-8 text-lg font-semibold">이번 달 매출</h2>
      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">현금</p>
          <p className="mt-1 text-xl font-semibold">
            {formatCurrency(totals.cash)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">카드</p>
          <p className="mt-1 text-xl font-semibold">
            {formatCurrency(totals.card)}
          </p>
        </div>
      </section>
      <Link
        href="/sales"
        className="mt-3 block rounded-lg border border-dashed border-neutral-300 p-3 text-center text-sm text-neutral-600"
      >
        매출 자세히 보기
      </Link>
    </main>
  );
}
