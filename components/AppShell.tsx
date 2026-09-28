"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";

const NO_CHROME_PREFIXES = ["/login", "/setup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = NO_CHROME_PREFIXES.some((p) => pathname.startsWith(p));

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
