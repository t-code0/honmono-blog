import { NextRequest, NextResponse } from "next/server";
import { generateArticle } from "@/lib/claude";
import { revalidatePath } from "next/cache";

export const maxDuration = 60; // Vercel Hobby: max 60s

export async function GET(request: NextRequest) {
  // CRON_SECRET guard
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateArticle();

    // Revalidate affected pages
    revalidatePath(`/ja`);
    revalidatePath(`/en`);
    revalidatePath(`/ja/${result.category}`);
    revalidatePath(`/en/${result.category}`);
    revalidatePath(`/ja/${result.category}/${result.slug}`);
    revalidatePath(`/en/${result.category}/${result.slug}`);

    return NextResponse.json({
      success: true,
      article: {
        slug: result.slug,
        title: result.title,
        category: result.category,
        url: `/ja/${result.category}/${result.slug}`,
      },
      cost: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costJpy: result.costJpy,
        durationMs: result.durationMs,
      },
    });
  } catch (error) {
    console.error("Article generation failed:", error);
    return NextResponse.json(
      {
        error: "Generation failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
