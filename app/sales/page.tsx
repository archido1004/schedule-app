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
        <Link href={`/sales?month=${prevMonth}`} className="px-2 py-1 text-sm text-neutral-500">
          ← 이전달
        </Link>
        <h1 className="text-lg font-semibold">{monthKey}</h1>
        <Link href={`/sales?month=${nextMonth}`} className="px-2 py-1 text-sm text-neutral-500">
          다음달 →
        </Link>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">현금 합계</p>
          <p className="mt-1 text-xl font-semibold">{formatCurrency(totals.cash)}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-500">카드 합계</p>
          <p className="mt-1 text-xl font-semibold">{formatCurrency(totals.card)}</p>
        </div>
      </section>

      <p className="mt-4 text-xs text-neutral-500">
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
