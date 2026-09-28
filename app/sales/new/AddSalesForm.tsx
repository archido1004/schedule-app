"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { todayKeyKST } from "@/lib/format";

export function AddSalesForm() {
  const router = useRouter();
  const [date, setDate] = useState(todayKeyKST());
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"CASH" | "CARD">("CASH");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, amount: Number(amount), method, memo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장에 실패했습니다.");
        return;
      }
      router.push("/sales");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        날짜
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        금액
        <input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2"
          required
          min={0}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("CASH")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            method === "CASH"
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-neutral-300 text-neutral-500"
          }`}
        >
          현금
        </button>
        <button
          type="button"
          onClick={() => setMethod("CARD")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
            method === "CARD"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-neutral-300 text-neutral-500"
          }`}
        >
          카드
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        메모
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "저장 중..." : "매출 등록"}
      </button>
    </form>
  );
}
