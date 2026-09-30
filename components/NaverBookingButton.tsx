"use client";

export function NaverBookingButton({ href }: { href: string }) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="mt-4 flex items-center justify-center gap-1.5 rounded-full bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-900/50"
    >
      네이버예약 바로가기
      <span aria-hidden>→</span>
    </a>
  );
}
