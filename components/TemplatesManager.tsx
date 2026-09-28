"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";

type Template = {
  id: string;
  title: string;
  content: string;
};

export function TemplatesManager({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      setTitle("");
      setContent("");
      setAdding(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function startEdit(t: Template) {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditContent(t.content);
  }

  async function handleSaveEdit(id: string) {
    setLoading(true);
    try {
      await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      setEditingId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 문구를 삭제할까요?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {templates.length === 0 && !adding && (
        <p className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-400 shadow-sm">
          등록된 문구가 없습니다.
        </p>
      )}

      {templates.map((t) =>
        editingId === t.id ? (
          <div key={t.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mb-2 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm font-medium"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleSaveEdit(t.id)}
                disabled={loading}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                저장
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div key={t.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">
                  {t.content}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <CopyButton text={t.content} />
              <button
                onClick={() => startEdit(t)}
                className="rounded-full bg-neutral-100 px-3.5 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="rounded-md px-3 py-2 text-sm text-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        )
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <input
            placeholder="제목 (예: 예약 확인 안내)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            required
          />
          <textarea
            placeholder="카카오톡으로 보낼 문구 내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            required
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-2xl border border-dashed border-neutral-300 p-3 text-center text-sm font-medium text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700"
        >
          + 자주 쓰는 문구 추가
        </button>
      )}
    </div>
  );
}
