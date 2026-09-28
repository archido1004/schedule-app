"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/share";

export function CopyButton({
  text,
  label = "복사하기",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        "rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-200"
      }
    >
      {copied ? "복사됨!" : label}
    </button>
  );
}
