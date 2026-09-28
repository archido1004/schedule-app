import { prisma } from "@/lib/db";
import { TemplatesManager } from "@/components/TemplatesManager";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await prisma.messageTemplate.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-md p-4 pt-6">
      <h1 className="mb-1 text-lg font-semibold">자주 쓰는 문구</h1>
      <p className="mb-4 text-sm text-neutral-500">
        복사 버튼을 누르고 카카오톡 대화창에 붙여넣으세요.
      </p>
      <TemplatesManager templates={templates} />
    </main>
  );
}
