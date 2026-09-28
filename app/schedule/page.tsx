import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentMonthKey, dateKeyToUTCDate } from "@/lib/format";

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

  const schedules = await prisma.schedule.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const grouped = schedules.reduce<Record<string, typeof schedules>>(
    (acc, s) => {
      const key = s.date.toISOString().slice(0, 10);
      (acc[key] ??= []).push(s);
      return acc;
    },
    {}
  );

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
        일정을 등록하면 시작 1시간 전 ~ 종료 1시간 후 시간대는 네이버예약에서도
        직접 예약불가 처리해두세요. (자동 연동은 아직 준비 중입니다)
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {Object.keys(grouped).length === 0 && (
          <p className="rounded-lg bg-white p-4 text-sm text-neutral-500 shadow-sm">
            이 달에 등록된 일정이 없습니다.
          </p>
        )}
        {Object.entries(grouped).map(([dateKey, items]) => (
          <div key={dateKey}>
            <p className="mb-2 text-sm font-medium text-neutral-500">
              {dateKey}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((s) => (
                <Link
                  key={s.id}
                  href={`/schedule/${s.id}`}
                  className="block rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.customerName}</span>
                    <span className="text-sm text-neutral-500">
                      {s.startTime}~{s.endTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/schedule/new"
        className="fixed bottom-24 right-4 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-lg"
      >
        + 일정 등록
      </Link>
    </main>
  );
}
