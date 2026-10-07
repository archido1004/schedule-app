"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildChannelInviteMessage } from "@/lib/share";
import { CopyButton } from "@/components/CopyButton";

type Schedule = {
  id: string;
  date: string; // YYYY-MM-DD
  endDate: string | null;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string | null;
  memo: string | null;
};

type SalesEntry = {
  id: string;
  amount: number;
  method: "CASH" | "CARD";
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = ["00", "30"];

export function ScheduleForm({
  schedule,
  initialDate,
  initialEndDate,
  existingSales,
  kakaoChannelUrl,
}: {
  schedule?: Schedule;
  initialDate?: string;
  initialEndDate?: string;
  existingSales?: SalesEntry;
  kakaoChannelUrl: string | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(schedule);

  const [date, setDate] = useState(schedule?.date ?? initialDate ?? "");
  const [endDate, setEndDate] = useState(
    schedule?.endDate ?? initialEndDate ?? ""
  );
  const [isRange, setIsRange] = useState(
    Boolean(schedule?.endDate) ||
      Boolean(initialEndDate && initialEndDate !== initialDate)
  );
  const [startTime, setStartTime] = useState(schedule?.startTime ?? "09:00");
  const [customerName, setCustomerName] = useState(schedule?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(schedule?.customerPhone ?? "");
  const [memo, setMemo] = useState(schedule?.memo ?? "");
  const [salesAmount, setSalesAmount] = useState(
    existingSales ? String(existingSales.amount) : ""
  );
  const [salesMethod, setSalesMethod] = useState<"CASH" | "CARD">(
    existingSales?.method ?? "CASH"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleRange() {
    setIsRange((prev) => {
      const next = !prev;
      if (!next) setEndDate("");
      else if (!endDate) setEndDate(date);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const effectiveTime = isRange ? "00:00" : startTime;
    const payload = {
      date,
      endDate: isRange ? endDate || date : null,
      startTime: effectiveTime,
      endTime: effectiveTime,
      customerName,
      customerPhone,
      memo,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/schedules/${schedule!.id}` : "/api/schedules",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장에 실패했습니다.");
        return;
      }

      const scheduleId = isEdit ? schedule!.id : data.id;
      const amount = Number(salesAmount);

      if (salesAmount && amount > 0) {
        if (existingSales) {
          await fetch(`/api/sales/${existingSales.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, amount, method: salesMethod }),
          });
        } else {
          await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date,
              amount,
              method: salesMethod,
              scheduleId,
              memo: customerName,
            }),
          });
        }
      } else if (existingSales) {
        await fetch(`/api/sales/${existingSales.id}`, { method: "DELETE" });
      }

      router.push("/schedule");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!schedule) return;
    if (!confirm("이 일정을 삭제할까요? (연결된 매출 기록도 함께 삭제됩니다)")) return;
    if (existingSales) {
      await fetch(`/api/sales/${existingSales.id}`, { method: "DELETE" });
    }
    await fetch(`/api/schedules/${schedule.id}`, { method: "DELETE" });
    router.push("/schedule");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {isRange ? "기간 일정 (종일)" : "날짜/시간"}
        </p>
        <button
          type="button"
          onClick={toggleRange}
          className="text-xs text-blue-600 underline dark:text-blue-400"
        >
          {isRange ? "하루 일정으로 변경" : "여러 날짜(기간)로 등록"}
        </button>
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          {isRange ? "시작일" : "날짜"}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            required
          />
        </label>
        {isRange ? (
          <label className="flex flex-1 flex-col gap-1 text-sm">
            종료일
            <input
              type="date"
              value={endDate}
              min={date}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              required
            />
          </label>
        ) : (
          <label className="flex flex-1 flex-col gap-1 text-sm">
            시간
            <div className="flex gap-2">
              <select
                value={startTime.split(":")[0] ?? "09"}
                onChange={(e) =>
                  setStartTime(
                    `${e.target.value}:${startTime.split(":")[1] ?? "00"}`
                  )
                }
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                required
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}시
                  </option>
                ))}
              </select>
              <select
                value={startTime.split(":")[1] ?? "00"}
                onChange={(e) =>
                  setStartTime(
                    `${startTime.split(":")[0] ?? "09"}:${e.target.value}`
                  )
                }
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                required
              >
                {MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}분
                  </option>
                ))}
              </select>
            </div>
          </label>
        )}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        고객명
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        연락처
        <input
          type="tel"
          placeholder="010-0000-0000"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </label>

      {customerPhone && (
        <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800">
          <span>카카오톡 채널 추가 안내 보내기</span>
          {kakaoChannelUrl ? (
            <CopyButton text={buildChannelInviteMessage(kakaoChannelUrl)} />
          ) : (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              설정에서 채널 링크를 먼저 등록하세요
            </span>
          )}
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          매출 (선택)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="금액"
            value={salesAmount ? Number(salesAmount).toLocaleString("ko-KR") : ""}
            onChange={(e) =>
              setSalesAmount(e.target.value.replace(/[^0-9]/g, ""))
            }
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <button
            type="button"
            onClick={() => setSalesMethod("CASH")}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              salesMethod === "CASH"
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
            }`}
          >
            현금
          </button>
          <button
            type="button"
            onClick={() => setSalesMethod("CARD")}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
              salesMethod === "CARD"
                ? "border-green-600 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-950/40 dark:text-green-300"
                : "border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
            }`}
          >
            카드
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        메모
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          rows={3}
        />
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-sm shadow-blue-500/30 disabled:opacity-50"
      >
        {loading ? "저장 중..." : isEdit ? "수정 저장" : "일정 등록"}
      </button>

      {isEdit && (
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900 dark:text-red-400"
        >
          삭제
        </button>
      )}
    </form>
  );
}
