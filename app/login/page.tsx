import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const existing = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!existing) redirect("/setup");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-xl font-semibold">PIN 로그인</h1>
      <LoginForm />
    </main>
  );
}
