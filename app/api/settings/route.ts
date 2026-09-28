import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/require-session";

export async function PATCH(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  const { kakaoChannelUrl } = await request.json();

  const settings = await prisma.appSettings.update({
    where: { id: "singleton" },
    data: { kakaoChannelUrl: kakaoChannelUrl || null },
  });

  return NextResponse.json(settings);
}
