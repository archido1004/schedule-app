"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Wallet, MessageSquareText, Settings } from "lucide-react";

const ITEMS = [
  { href: "/", label: "홈", Icon: Home },
  { href: "/schedule", label: "일정", Icon: CalendarDays },
  { href: "/sales", label: "매출", Icon: Wallet },
  { href: "/templates", label: "문구", Icon: MessageSquareText },
  { href: "/settings", label: "설정", Icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 border-b-2 py-2.5 text-center text-xs font-medium transition-colors ${
                  active
                    ? "border-neutral-900 text-neutral-900 font-semibold"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={active ? "text-blue-600" : ""}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
