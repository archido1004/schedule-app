import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { pin } = await request.json();
  if (typeof pin !== "string") {
    return NextResponse.json({ error: "PIN을 입력하세요." }, { status: 400 });
  }

  const settings = await prisma.appSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) {
    return NextResponse.json(
      { error: "먼저 PIN을 설정하세요." },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(pin, settings.pinHash);
  if (!valid) {
    return NextResponse.json(
      { error: "PIN이 일치하지 않습니다." },
      { status: 401 }
    );
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
