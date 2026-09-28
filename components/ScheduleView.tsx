"use client";

import { useState } from "react";
import Link from "next/link";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";

type ScheduleItem = { id: string; customerName: string; startTime: string };

export function ScheduleView({
  monthKey,
  todayKey,
  schedulesByDate,
  revenueByDate,
  sortedDateKeys,
}: {
  monthKey: string;
  todayKey: string;
  schedulesByDate: Record<string, ScheduleItem[]>;
  revenueByDate: Record<string, number>;
  sortedDateKeys: string[];
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
        />
      ) : (
        <div className="flex flex-col gap-4">
          {sortedDateKeys.length === 0 && (
            <p className="rounded-lg bg-white p-4 text-sm text-neutral-500 shadow-sm">
              이 달에 등록된 일정이 없습니다.
            </p>
          )}
          {sortedDateKeys.map((dateKey) => {
            const weekday = new Date(dateKey + "T00:00:00Z").getUTCDay();
            const weekdayClass =
              weekday === 0
                ? "text-red-500"
                : weekday === 6
                ? "text-blue-500"
                : "text-neutral-500";
            return (
              <div key={dateKey}>
                <p className={`mb-2 text-sm font-medium ${weekdayClass}`}>
                  {dateKey}
                </p>
                <div className="flex flex-col gap-2">
                  {schedulesByDate[dateKey].map((s) => (
                    <Link
                      key={s.id}
                      href={`/schedule/${s.id}`}
                      className="block rounded-lg border-l-4 border-l-indigo-500 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{s.customerName}</span>
                        <span className="text-sm text-neutral-500">
                          {s.startTime}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
