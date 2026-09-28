"use client";

import { useState } from "react";
import Link from "next/link";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { weekdayColorClass, weekdayIndex, weekdayLabel } from "@/lib/format";

type ScheduleItem = {
  id: string;
  customerName: string;
  startTime: string;
  method?: "CASH" | "CARD";
};
type RangeEvent = { id: string; title: string; startKey: string; endKey: string };

function dotColor(method?: "CASH" | "CARD") {
  if (method === "CASH") return "bg-blue-500";
  if (method === "CARD") return "bg-green-500";
  return "bg-neutral-300";
}

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
  const [view, setView] = useState<"calendar" | "list">("list");

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-full bg-neutral-100 p-1 text-sm">
        <button
          onClick={() => setView("calendar")}
          className={`flex-1 rounded-full py-1.5 font-semibold transition-colors ${
            view === "calendar"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-400"
          }`}
        >
          캘린더
        </button>
        <button
          onClick={() => setView("list")}
          className={`flex-1 rounded-full py-1.5 font-semibold transition-colors ${
            view === "list"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-400"
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
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {sortedDateKeys.length === 0 && rangeEvents.length === 0 ? (
            <p className="p-4 text-sm text-neutral-400">
              이 달에 등록된 일정이 없습니다.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {rangeEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/schedule/${ev.id}`}
                  className="flex items-center gap-2.5 bg-blue-50/50 px-3.5 py-2.5 text-sm transition-colors hover:bg-blue-100/60"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                  <span className="w-[70px] shrink-0 text-xs font-medium text-blue-500">
                    종일
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">
                    {ev.title}
                  </span>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {ev.startKey.slice(5)}~{ev.endKey.slice(5)}
                  </span>
                  <span className="shrink-0 text-neutral-300">›</span>
                </Link>
              ))}
              {sortedDateKeys.flatMap((dateKey) =>
                schedulesByDate[dateKey].map((s, idx) => (
                  <Link
                    key={s.id}
                    href={`/schedule/${s.id}`}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-neutral-50"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${dotColor(s.method)}`}
                    />
                    <span
                      className={`w-[70px] shrink-0 text-xs font-medium ${weekdayColorClass(
                        weekdayIndex(dateKey)
                      )}`}
                    >
                      {idx === 0
                        ? `${dateKey.slice(5)} ${weekdayLabel(dateKey)}`
                        : ""}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">
                      {s.customerName}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {s.startTime}
                    </span>
                    <span className="shrink-0 text-neutral-300">›</span>
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
