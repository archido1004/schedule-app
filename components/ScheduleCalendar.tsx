"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";

type CalendarSchedule = { id: string; customerName: string; startTime: string };

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function weekdayColor(index: number) {
  if (index === 0) return "text-red-500";
  if (index === 6) return "text-blue-500";
  return "text-neutral-500";
}

export function ScheduleCalendar({
  monthKey,
  todayKey,
  schedulesByDate,
  revenueByDate,
}: {
  monthKey: string; // YYYY-MM
  todayKey: string; // YYYY-MM-DD
  schedulesByDate: Record<string, CalendarSchedule[]>;
  revenueByDate: Record<string, number>;
}) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`py-2 text-center text-xs font-semibold ${weekdayColor(i)}`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return (
              <div
                key={`empty-${i}`}
                className="min-h-[76px] border-b border-r border-neutral-100 bg-neutral-50/50"
              />
            );
          }

          const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
          const weekday = i % 7;
          const items = schedulesByDate[dateKey] ?? [];
          const revenue = revenueByDate[dateKey];
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dateKey}
              className="flex min-h-[76px] flex-col gap-0.5 border-b border-r border-neutral-100 p-1 last:border-r-0"
            >
              <Link
                href={`/schedule/new?date=${dateKey}`}
                className={`inline-flex h-5 w-5 items-center justify-center self-start rounded-full text-xs hover:ring-1 hover:ring-neutral-300 ${weekdayColor(
                  weekday
                )} ${isToday ? "bg-neutral-900 !text-white font-semibold" : ""}`}
              >
                {day}
              </Link>
              <div className="flex flex-col gap-0.5">
                {items.slice(0, 2).map((s) => (
                  <Link
                    key={s.id}
                    href={`/schedule/${s.id}`}
                    className="truncate rounded bg-indigo-50 px-1 py-0.5 text-[10px] text-indigo-700 hover:bg-indigo-100"
                  >
                    {s.customerName}
                  </Link>
                ))}
                {items.length > 2 && (
                  <span className="px-1 text-[10px] text-neutral-400">
                    +{items.length - 2}건 더
                  </span>
                )}
              </div>
              {revenue ? (
                <span className="mt-auto truncate px-1 text-[10px] font-medium text-green-600">
                  {formatCurrency(revenue)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
