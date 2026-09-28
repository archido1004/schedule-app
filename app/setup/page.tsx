import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const existing = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });
  if (existing) redirect("/login");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">처음 오셨네요</h1>
        <p className="mt-1 text-sm text-neutral-500">
          앞으로 로그인에 사용할 PIN 번호를 설정하세요 (숫자 4~8자리).
        </p>
      </div>
      <SetupForm />
    </main>
  );
}
