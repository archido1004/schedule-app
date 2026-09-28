import { prisma } from "@/lib/db";
import { ScheduleForm } from "@/components/ScheduleForm";

export const dynamic = "force-dynamic";

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; endDate?: string }>;
}) {
  const { date, endDate } = await searchParams;
  const settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold">일정 등록</h1>
      <ScheduleForm
        initialDate={date}
        initialEndDate={endDate}
        kakaoChannelUrl={settings?.kakaoChannelUrl ?? null}
      />
    </main>
  );
}
