import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScheduleForm } from "@/components/ScheduleForm";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [schedule, settings, salesEntry] = await Promise.all([
    prisma.schedule.findUnique({ where: { id } }),
    prisma.appSettings.findUnique({ where: { id: "singleton" } }),
    prisma.salesEntry.findFirst({ where: { scheduleId: id } }),
  ]);

  if (!schedule) notFound();

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold">일정 수정</h1>
      <ScheduleForm
        schedule={{
          id: schedule.id,
          date: schedule.date.toISOString().slice(0, 10),
          endDate: schedule.endDate
            ? schedule.endDate.toISOString().slice(0, 10)
            : null,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          customerName: schedule.customerName,
          customerPhone: schedule.customerPhone,
          memo: schedule.memo,
        }}
        existingSales={
          salesEntry
            ? {
                id: salesEntry.id,
                amount: salesEntry.amount,
                method: salesEntry.method as "CASH" | "CARD",
              }
            : undefined
        }
        kakaoChannelUrl={settings?.kakaoChannelUrl ?? null}
      />
    </main>
  );
}
