import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold dark:text-neutral-100">설정</h1>

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          화면 테마
        </p>
        <ThemeToggle />
      </div>

      <SettingsForm initialKakaoChannelUrl={settings?.kakaoChannelUrl ?? ""} />
    </main>
  );
}
