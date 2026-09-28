import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  currentMonthKey,
  dateKeyToUTCDate,
  formatDateKey,
  todayKeyKST,
} from "@/lib/format";
import { ScheduleView } from "@/components/ScheduleView";

const NAVER_BOOKING_BIZ_ID = "712538";

function naverBookingUrl(): string {
  const todayKey = todayKeyKST();
  const rollEnd = new Date(dateKeyToUTCDate(todayKey).getTime() + 29 * 86400000);
  const endKey = formatDateKey(rollEnd);
  const params = new URLSearchParams({
    dateDropdownType: "MONTH",
    startDateTime: todayKey,
    endDateTime: endKey,
    dateFilter: "USEDATE",
    searchValueCode: "USER_NAME",
  });
  return `https://partner.booking.naver.com/bizes/${NAVER_BOOKING_BIZ_ID}/booking-list-view?${params}`;
}

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
      where: {
        date: { lt: end },
        OR: [{ endDate: null, date: { gte: start } }, { endDate: { gte: start } }],
      },
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
  const rangeEvents: {
    id: string;
    title: string;
    startKey: string;
    endKey: string;
  }[] = [];

  for (const s of schedules) {
    const key = s.date.toISOString().slice(0, 10);
    if (s.endDate) {
      rangeEvents.push({
        id: s.id,
        title: s.customerName,
        startKey: key,
        endKey: s.endDate.toISOString().slice(0, 10),
      });
    } else {
      (schedulesByDate[key] ??= []).push({
        id: s.id,
        customerName: s.customerName,
        startTime: s.startTime,
      });
    }
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

      <a
        href={naverBookingUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-between rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800 hover:bg-green-100"
      >
        네이버예약 바로가기
        <span aria-hidden>→</span>
      </a>

      <div className="mt-4">
        <ScheduleView
          monthKey={monthKey}
          todayKey={todayKeyKST()}
          schedulesByDate={schedulesByDate}
          revenueByDate={revenueByDate}
          sortedDateKeys={sortedDateKeys}
          rangeEvents={rangeEvents}
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
