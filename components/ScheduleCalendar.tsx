"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

type CalendarSchedule = { id: string; customerName: string; startTime: string };
type RangeEvent = { id: string; title: string; startKey: string; endKey: string };

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
  rangeEvents,
}: {
  monthKey: string; // YYYY-MM
  todayKey: string; // YYYY-MM-DD
  schedulesByDate: Record<string, CalendarSchedule[]>;
  revenueByDate: Record<string, number>;
  rangeEvents: RangeEvent[];
}) {
  const [selStart, setSelStart] = useState<string | null>(null);
  const [selEnd, setSelEnd] = useState<string | null>(null);

  const [year, month] = monthKey.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function handleDayClick(dateKey: string) {
    if (!selStart || (selStart && selEnd && selStart !== selEnd)) {
      setSelStart(dateKey);
      setSelEnd(dateKey);
      return;
    }
    if (dateKey < selStart) {
      setSelEnd(selStart);
      setSelStart(dateKey);
    } else {
      setSelEnd(dateKey);
    }
  }

  function clearSelection() {
    setSelStart(null);
    setSelEnd(null);
  }

  const hasRange = Boolean(selStart && selEnd && selStart !== selEnd);
  const selectedDays =
    selStart && selEnd
      ? Math.round(
          (new Date(selEnd).getTime() - new Date(selStart).getTime()) /
            86400000
        ) + 1
      : 0;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
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
            const isSelected =
              selStart && selEnd && dateKey >= selStart && dateKey <= selEnd;

            const dayEvents = rangeEvents.filter(
              (ev) => dateKey >= ev.startKey && dateKey <= ev.endKey
            );

            return (
              <div
                key={dateKey}
                onClick={() => handleDayClick(dateKey)}
                className={`flex min-h-[76px] cursor-pointer flex-col gap-0.5 border-b border-r border-neutral-100 p-1 last:border-r-0 ${
                  isSelected ? "bg-indigo-50" : ""
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center self-start rounded-full text-xs ${weekdayColor(
                    weekday
                  )} ${isToday ? "bg-neutral-900 !text-white font-semibold" : ""}`}
                >
                  {day}
                </span>

                {dayEvents.map((ev) => {
                  const roundLeft = dateKey === ev.startKey || weekday === 0;
                  const roundRight = dateKey === ev.endKey || weekday === 6;
                  const showLabel = dateKey === ev.startKey || weekday === 0;
                  return (
                    <Link
                      key={ev.id}
                      href={`/schedule/${ev.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`block truncate bg-violet-200 px-1 py-0.5 text-[10px] text-violet-800 hover:bg-violet-300 ${
                        roundLeft ? "rounded-l" : "-ml-1"
                      } ${roundRight ? "rounded-r" : "-mr-1"}`}
                    >
                      {showLabel ? ev.title : " "}
                    </Link>
                  );
                })}

                <div className="flex flex-col gap-0.5">
                  {items.slice(0, 2).map((s) => (
                    <Link
                      key={s.id}
                      href={`/schedule/${s.id}`}
                      onClick={(e) => e.stopPropagation()}
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

      <div className="mt-2 flex items-center justify-between rounded-2xl bg-neutral-100 px-3.5 py-2.5 text-sm">
        {selStart ? (
          <>
            <span className="text-neutral-600">
              {hasRange
                ? `${selStart} ~ ${selEnd} (${selectedDays}일 선택됨)`
                : `${selStart} 선택됨`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="text-xs text-neutral-500 underline"
              >
                취소
              </button>
              <Link
                href={
                  hasRange
                    ? `/schedule/new?date=${selStart}&endDate=${selEnd}`
                    : `/schedule/new?date=${selStart}`
                }
                className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white"
              >
                {hasRange ? "이 기간으로 등록" : "이 날짜로 등록"}
              </Link>
            </div>
          </>
        ) : (
          <span className="text-xs text-neutral-500">
            날짜를 눌러서 선택하세요. 두 날짜를 선택하면 기간(종일) 일정으로
            등록할 수 있어요.
          </span>
        )}
      </div>
    </div>
  );
}
