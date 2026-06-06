import { NextRequest, NextResponse } from "next/server";
import { generateArticle, replenishKeywordsIfNeeded } from "@/lib/claude";
import { revalidatePath } from "next/cache";

const ARTICLES_PER_RUN = 3;

export const maxDuration = 300; // Vercel Hobby: max 300s for cron

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: {
    index: number;
    success: boolean;
    slug?: string;
    title?: string;
    category?: string;
    costJpy?: number;
    durationMs?: number;
    error?: string;
  }[] = [];

  // Generate articles sequentially
  for (let i = 0; i < ARTICLES_PER_RUN; i++) {
    try {
      const result = await generateArticle();

      revalidatePath(`/ja`);
      revalidatePath(`/ja/${result.category}`);
      revalidatePath(`/ja/${result.category}/${result.slug}`);

      results.push({
        index: i + 1,
        success: true,
        slug: result.slug,
        title: result.title,
        category: result.category,
        costJpy: result.costJpy,
        durationMs: result.durationMs,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Article ${i + 1}/${ARTICLES_PER_RUN} failed:`, message);
      results.push({
        index: i + 1,
        success: false,
        error: message,
      });
      // No pending keywords left → stop loop
      if (message.includes("No pending keywords")) break;
    }
  }

  // Replenish keywords if running low
  let replenished = 0;
  try {
    replenished = await replenishKeywordsIfNeeded();
  } catch (error) {
    console.error("Keyword replenishment failed:", error);
  }

  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalCost = succeeded.reduce((sum, r) => sum + (r.costJpy || 0), 0);
  const totalDuration = succeeded.reduce((sum, r) => sum + (r.durationMs || 0), 0);

  console.log(
    `[CRON] Generated ${succeeded.length}/${ARTICLES_PER_RUN} articles. ` +
    `Cost: ${totalCost.toFixed(2)}円, Duration: ${(totalDuration / 1000).toFixed(1)}s. ` +
    `Replenished: ${replenished} keywords.`
  );

  return NextResponse.json({
    summary: {
      total: ARTICLES_PER_RUN,
      succeeded: succeeded.length,
      failed: failed.length,
      totalCostJpy: Math.round(totalCost * 10000) / 10000,
      totalDurationMs: totalDuration,
      keywordsReplenished: replenished,
    },
    results,
  });
}
