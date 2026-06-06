import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

  return NextResponse.json({
    SUPABASE_URL: supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : "NOT SET",
    ANON_KEY: anonKey ? `${anonKey.slice(0, 20)}...${anonKey.slice(-10)}` : "NOT SET",
    SERVICE_KEY: serviceKey ? `${serviceKey.slice(0, 20)}...${serviceKey.slice(-10)}` : "NOT SET",
    ANTHROPIC_KEY: anthropicKey ? `${anthropicKey.slice(0, 15)}...${anthropicKey.slice(-5)}` : "NOT SET",
    CRON_SECRET: process.env.CRON_SECRET ? "SET" : "NOT SET",
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "NOT SET",
  });
}
