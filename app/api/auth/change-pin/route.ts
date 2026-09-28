import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/require-session";

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { currentPin, newPin } = await request.json();
  if (typeof newPin !== "string" || !/^\d{4,8}$/.test(newPin)) {
    return NextResponse.json(
      { error: "새 PIN은 4~8자리 숫자여야 합니다." },
      { status: 400 }
    );
  }

  const settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    return NextResponse.json(
      { error: "설정된 PIN이 없습니다." },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(currentPin ?? "", settings.pinHash);
  if (!valid) {
    return NextResponse.json(
      { error: "현재 PIN이 일치하지 않습니다." },
      { status: 401 }
    );
  }

  const pinHash = await bcrypt.hash(newPin, 10);
  await prisma.appSettings.update({
    where: { id: "singleton" },
    data: { pinHash },
  });

  return NextResponse.json({ ok: true });
}
