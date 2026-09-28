"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("이 매출 내역을 삭제할까요?")) return;
    await fetch(`/api/sales/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-400 shadow-sm">
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
                entry.method === "CASH" ? "bg-green-500" : "bg-blue-500"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(entry.amount)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    entry.method === "CASH"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {entry.method === "CASH" ? "현금" : "카드"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-neutral-400">
                {entry.date} {entry.memo ? `· ${entry.memo}` : ""}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDelete(entry.id);
              }}
              className="shrink-0 text-xs text-red-500"
            >
              삭제
            </button>
            {entry.scheduleId && (
              <span className="shrink-0 text-neutral-300">›</span>
            )}
          </>
        );

        const className =
          "flex items-center gap-2.5 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md";

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
