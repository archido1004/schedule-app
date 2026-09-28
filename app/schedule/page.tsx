import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  currentMonthKey,
  dateKeyToUTCDate,
  formatDateKey,
  todayKeyKST,
} from "@/lib/format";
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
          className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200"
        >
          ← 이전달
        </Link>
        <h1 className="text-xl font-bold tracking-tight">{monthKey}</h1>
        <Link
          href={`/schedule?month=${nextMonth}`}
          className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200"
        >
          다음달 →
        </Link>
      </div>

      <NaverBookingButton href={naverBookingUrl()} />

      <hr className="mt-4 border-neutral-200" />

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
