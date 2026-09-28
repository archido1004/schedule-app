import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const existing = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "이미 PIN이 설정되어 있습니다." },
      { status: 400 }
    );
  }

  const { pin } = await request.json();
  if (typeof pin !== "string" || !/^\d{4,8}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN은 4~8자리 숫자여야 합니다." },
      { status: 400 }
    );
  }

  const pinHash = await bcrypt.hash(pin, 10);
  await prisma.appSettings.create({ data: { id: "singleton", pinHash } });
  await createSession();

  return NextResponse.json({ ok: true });
}
