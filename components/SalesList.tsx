"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";

type SalesEntry = {
  id: string;
  date: string;
  amount: number;
  method: "CASH" | "CARD";
  memo: string | null;
  scheduleId: string | null;
};

export function SalesList({ entries }: { entries: SalesEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-400 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
        이 달에 등록된 매출이 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const content = (
          <>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                entry.method === "CASH" ? "bg-blue-500" : "bg-green-500"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(entry.amount)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    entry.method === "CASH"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  }`}
                >
                  {entry.method === "CASH" ? "현금" : "카드"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-neutral-400 dark:text-neutral-500">
                {entry.date} {entry.memo ? `· ${entry.memo}` : ""}
              </p>
            </div>
            {entry.scheduleId && (
              <span className="shrink-0 text-neutral-300 dark:text-neutral-600">›</span>
            )}
          </>
        );

        const className =
          "flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900";

        return entry.scheduleId ? (
          <Link key={entry.id} href={`/schedule/${entry.scheduleId}`} className={className}>
            {content}
          </Link>
        ) : (
          <div key={entry.id} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
