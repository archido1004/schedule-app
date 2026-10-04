import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { currentMonthKey, dateKeyToUTCDate, formatCurrency } from "@/lib/format";
import { SalesList } from "@/components/SalesList";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const monthKey = month || currentMonthKey();

  const start = dateKeyToUTCDate(`${monthKey}-01`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);

  const yearStart = dateKeyToUTCDate(`${monthKey.slice(0, 4)}-01-01`);
  const yearEnd = dateKeyToUTCDate(`${Number(monthKey.slice(0, 4)) + 1}-01-01`);

  const [entries, yearAgg] = await Promise.all([
    prisma.salesEntry.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
    }),
    prisma.salesEntry.aggregate({
      _sum: { amount: true },
      where: { date: { gte: yearStart, lt: yearEnd } },
    }),
  ]);
  const yearTotal = yearAgg._sum.amount ?? 0;

  const totals = entries.reduce(
    (acc, e) => {
      if (e.method === "CASH") acc.cash += e.amount;
      else acc.card += e.amount;
      return acc;
    },
    { cash: 0, card: 0 }
  );

  const [year, mon] = monthKey.split("-").map(Number);
  const prevMonth = new Date(Date.UTC(year, mon - 2, 1)).toISOString().slice(0, 7);
  const nextMonth = new Date(Date.UTC(year, mon, 1)).toISOString().slice(0, 7);

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/sales?month=${prevMonth}`}
          aria-label="이전달"
          className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <ChevronLeft size={16} strokeWidth={2.5} />
          이전달
        </Link>
        <h1 className="text-xl font-bold tracking-tight dark:text-neutral-100">
          {monthKey}
        </h1>
        <Link
          href={`/sales?month=${nextMonth}`}
          aria-label="다음달"
          className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          다음달
          <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">합계</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(totals.cash + totals.card)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm text-neutral-500 dark:text-neutral-400">
            <p className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" /> 현금 {formatCurrency(totals.cash)}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" /> 카드 {formatCurrency(totals.card)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">{monthKey.slice(0, 4)}년 연매출</p>
        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{formatCurrency(yearTotal)}</p>
      </section>

      <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
        매출은{" "}
        <Link href="/schedule/new" className="underline">
          일정 등록
        </Link>
        {" "}화면에서 함께 입력하세요.
      </p>

      <div className="mt-3">
        <SalesList
          entries={entries.map((e) => ({
            id: e.id,
            date: e.date.toISOString().slice(0, 10),
            amount: e.amount,
            method: e.method as "CASH" | "CARD",
            memo: e.memo,
            scheduleId: e.scheduleId,
          }))}
        />
      </div>
    </main>
  );
}
