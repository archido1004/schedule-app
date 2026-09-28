"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "홈" },
  { href: "/schedule", label: "일정" },
  { href: "/sales", label: "매출" },
  { href: "/templates", label: "문구" },
  { href: "/settings", label: "설정" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`block border-b-2 py-4 text-center text-base font-medium transition-colors ${
                  active
                    ? "border-neutral-900 text-neutral-900 font-semibold"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
