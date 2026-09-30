import Link from "next/link";
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

  const entries = await prisma.salesEntry.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

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
          className="rounded-full px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400"
        >
          ← 이전달
        </Link>
        <h1 className="text-xl font-bold tracking-tight">{monthKey}</h1>
        <Link
          href={`/sales?month=${nextMonth}`}
          className="rounded-full px-3 py-1.5 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400"
        >
          다음달 →
        </Link>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> 현금 합계
          </p>
          <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totals.cash)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-green-500" /> 카드 합계
          </p>
          <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totals.card)}
          </p>
        </div>
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
