import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";

export async function requireSession() {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
