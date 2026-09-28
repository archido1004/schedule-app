"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForm({
  initialKakaoChannelUrl,
}: {
  initialKakaoChannelUrl: string;
}) {
  const router = useRouter();

  const [kakaoChannelUrl, setKakaoChannelUrl] = useState(initialKakaoChannelUrl);
  const [channelSaved, setChannelSaved] = useState(false);
  const [channelLoading, setChannelLoading] = useState(false);

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSaved, setPinSaved] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  async function handleSaveChannel(e: React.FormEvent) {
    e.preventDefault();
    setChannelLoading(true);
    setChannelSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kakaoChannelUrl }),
      });
      setChannelSaved(true);
      router.refresh();
    } finally {
      setChannelLoading(false);
    }
  }

  async function handleChangePin(e: React.FormEvent) {
    e.preventDefault();
    setPinError(null);
    setPinSaved(false);
    setPinLoading(true);
    try {
      const res = await fetch("/api/auth/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPinError(data.error ?? "변경에 실패했습니다.");
        return;
      }
      setCurrentPin("");
      setNewPin("");
      setPinSaved(true);
    } finally {
      setPinLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">
          카카오톡 채널 링크
        </h2>
        <p className="mb-2 text-xs text-neutral-500">
          내 카카오톡 채널의 &quot;친구 추가&quot; 링크(pf.kakao.com/...)를
          등록하면, 일정에 예약자 연락처를 입력할 때 안내 문구를 바로
          복사해서 보낼 수 있어요.
        </p>
        <form onSubmit={handleSaveChannel} className="flex flex-col gap-2">
          <input
            type="url"
            placeholder="https://pf.kakao.com/_xxxxxx/friend"
            value={kakaoChannelUrl}
            onChange={(e) => setKakaoChannelUrl(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={channelLoading}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {channelLoading ? "저장 중..." : "저장"}
          </button>
          {channelSaved && (
            <p className="text-xs text-green-600">저장되었습니다.</p>
          )}
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">
          PIN 변경
        </h2>
        <form onSubmit={handleChangePin} className="flex flex-col gap-2">
          <input
            type="password"
            inputMode="numeric"
            placeholder="현재 PIN"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="새 PIN (4~8자리 숫자)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            required
          />
          {pinError && <p className="text-xs text-red-600">{pinError}</p>}
          {pinSaved && (
            <p className="text-xs text-green-600">PIN이 변경되었습니다.</p>
          )}
          <button
            type="submit"
            disabled={pinLoading}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pinLoading ? "변경 중..." : "PIN 변경"}
          </button>
        </form>
      </section>

      <button
        onClick={handleLogout}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
      >
        로그아웃
      </button>
    </div>
  );
}
