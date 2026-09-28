"use client";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

type SalesEntry = {
  id: string;
  date: string;
  amount: number;
  method: "CASH" | "CARD";
  memo: string | null;
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
      <p className="rounded-lg bg-white p-4 text-sm text-neutral-500 shadow-sm">
        이 달에 등록된 매출이 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex items-center justify-between rounded-lg border-l-4 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
            entry.method === "CASH" ? "border-l-green-500" : "border-l-blue-500"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatCurrency(entry.amount)}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  entry.method === "CASH"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {entry.method === "CASH" ? "현금" : "카드"}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {entry.date} {entry.memo ? `· ${entry.memo}` : ""}
            </p>
          </div>
          <button
            onClick={() => handleDelete(entry.id)}
            className="text-xs text-red-600"
          >
            삭제
          </button>
        </div>
      ))}
    </div>
  );
}
