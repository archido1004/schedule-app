"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  function applyTheme(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <div className="flex gap-1 rounded-full bg-neutral-100 p-1 text-sm dark:bg-neutral-800">
      <button
        type="button"
        onClick={() => applyTheme("light")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 font-semibold transition-colors ${
          theme === "light"
            ? "bg-white text-neutral-900 shadow-sm"
            : "text-neutral-400 dark:text-neutral-500"
        }`}
      >
        <Sun size={16} />
        일반
      </button>
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 font-semibold transition-colors ${
          theme === "dark"
            ? "bg-neutral-900 text-white shadow-sm"
            : "text-neutral-400 dark:text-neutral-500"
        }`}
      >
        <Moon size={16} />
        다크모드
      </button>
    </div>
  );
}
