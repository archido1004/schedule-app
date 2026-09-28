"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SetupForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pin !== confirmPin) {
      setError("PIN이 서로 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "설정에 실패했습니다.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="password"
        inputMode="numeric"
        placeholder="새 PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="rounded-lg border border-neutral-300 px-4 py-3 text-lg tracking-widest"
        required
      />
      <input
        type="password"
        inputMode="numeric"
        placeholder="PIN 확인"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
        className="rounded-lg border border-neutral-300 px-4 py-3 text-lg tracking-widest"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {loading ? "설정 중..." : "PIN 설정하고 시작하기"}
      </button>
    </form>
  );
}
