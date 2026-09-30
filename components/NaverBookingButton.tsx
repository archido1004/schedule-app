"use client";

import { ExternalLink } from "lucide-react";

export function NaverBookingButton({ href }: { href: string }) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="mt-4 flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-600/30 transition-colors hover:bg-green-700"
    >
      네이버예약 바로가기
      <ExternalLink size={16} strokeWidth={2.5} />
    </a>
  );
}
