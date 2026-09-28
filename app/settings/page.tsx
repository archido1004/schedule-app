import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold">설정</h1>
      <SettingsForm initialKakaoChannelUrl={settings?.kakaoChannelUrl ?? ""} />
    </main>
  );
}
