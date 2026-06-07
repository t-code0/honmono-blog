import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import crypto from "crypto";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 clicks per window

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  const botPatterns = /bot|crawl|spider|scrape|curl|wget|python|httpx|axios/i;
  return botPatterns.test(userAgent);
}

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent");

    // Bot detection
    if (isBot(userAgent)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { articleId, programId } = await request.json();
    if (!articleId || !programId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const clientIp = getClientIp(request);
    const ipHash = hashIp(clientIp);

    // Rate limit check: count clicks from this IP in the last minute
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from("blog_affiliate_clicks")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart);

    if (countError) {
      // If rate limit check fails (e.g. column doesn't exist yet), allow the click
      // but log the error. This ensures graceful degradation before migration runs.
      console.error("Rate limit check failed:", countError.message);
    } else if (count !== null && count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }

    // Record the click with ip_hash and user_agent
    const { error: insertError } = await supabase
      .from("blog_affiliate_clicks")
      .insert({
        article_id: articleId,
        program_id: programId,
        ip_hash: ipHash,
        user_agent: userAgent,
      });

    if (insertError) {
      // Fallback: if new columns don't exist yet, insert without them
      if (insertError.message.includes("ip_hash") || insertError.message.includes("user_agent")) {
        await supabase.from("blog_affiliate_clicks").insert({
          article_id: articleId,
          program_id: programId,
        });
      } else {
        throw insertError;
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
