"use client";

import { useState } from "react";
import Link from "next/link";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { weekdayColorClass, weekdayIndex, weekdayLabel } from "@/lib/format";

type ScheduleItem = { id: string; customerName: string; startTime: string };
type RangeEvent = { id: string; title: string; startKey: string; endKey: string };

export function ScheduleView({
  monthKey,
  todayKey,
  schedulesByDate,
  revenueByDate,
  sortedDateKeys,
  rangeEvents,
}: {
  monthKey: string;
  todayKey: string;
  schedulesByDate: Record<string, ScheduleItem[]>;
  revenueByDate: Record<string, number>;
  sortedDateKeys: string[];
  rangeEvents: RangeEvent[];
}) {
  const [view, setView] = useState<"calendar" | "list">("calendar");

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-lg bg-neutral-100 p-1 text-sm">
        <button
          onClick={() => setView("calendar")}
          className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
            view === "calendar" ? "bg-white shadow-sm" : "text-neutral-500"
          }`}
        >
          캘린더
        </button>
        <button
          onClick={() => setView("list")}
          className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
            view === "list" ? "bg-white shadow-sm" : "text-neutral-500"
          }`}
        >
          리스트
        </button>
      </div>

      {view === "calendar" ? (
        <ScheduleCalendar
          monthKey={monthKey}
          todayKey={todayKey}
          schedulesByDate={schedulesByDate}
          revenueByDate={revenueByDate}
          rangeEvents={rangeEvents}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {sortedDateKeys.length === 0 && rangeEvents.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">
              이 달에 등록된 일정이 없습니다.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {rangeEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/schedule/${ev.id}`}
                  className="flex items-center gap-2 bg-violet-50/60 px-3 py-2 text-sm hover:bg-violet-100"
                >
                  <span className="w-[86px] shrink-0 text-violet-500">
                    종일
                  </span>
                  <span className="min-w-0 flex-1 truncate">{ev.title}</span>
                  <span className="shrink-0 text-xs text-neutral-500">
                    {ev.startKey.slice(5)}~{ev.endKey.slice(5)}
                  </span>
                </Link>
              ))}
              {sortedDateKeys.flatMap((dateKey) =>
                schedulesByDate[dateKey].map((s, idx) => (
                  <Link
                    key={s.id}
                    href={`/schedule/${s.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50"
                  >
                    <span
                      className={`w-[86px] shrink-0 ${weekdayColorClass(
                        weekdayIndex(dateKey)
                      )}`}
                    >
                      {idx === 0
                        ? `${dateKey.slice(5)} ${weekdayLabel(dateKey)}`
                        : ""}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {s.customerName}
                    </span>
                    <span className="shrink-0 text-neutral-500">
                      {s.startTime}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
