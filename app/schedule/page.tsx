import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  currentMonthKey,
  dateKeyToUTCDate,
  formatDateKey,
  todayKeyKST,
} from "@/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScheduleView } from "@/components/ScheduleView";
import { NaverBookingButton } from "@/components/NaverBookingButton";

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

  const methodByScheduleId: Record<string, "CASH" | "CARD"> = {};
  for (const entry of salesEntries) {
    if (entry.scheduleId) {
      methodByScheduleId[entry.scheduleId] = entry.method as "CASH" | "CARD";
    }
  }

  const schedulesByDate: Record<
    string,
    { id: string; customerName: string; startTime: string; method?: "CASH" | "CARD" }[]
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
        method: methodByScheduleId[s.id],
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
          href={`/schedule?month=${nextMonth}`}
          aria-label="다음달"
          className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          다음달
          <ChevronRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      <NaverBookingButton href={naverBookingUrl()} />

      <div className="mt-4 h-px bg-neutral-300 dark:bg-neutral-600" />

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
        className="fixed bottom-6 right-4 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105"
      >
        + 일정 등록
      </Link>
    </main>
  );
}
