import { NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/affiliates";

export async function POST(request: NextRequest) {
  try {
    const { articleId, programId } = await request.json();
    if (!articleId || !programId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }
    await trackClick(articleId, programId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
