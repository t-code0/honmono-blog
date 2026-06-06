import { getServiceClient, getSupabase } from "./supabase";

export interface AffiliateProgram {
  id: number;
  name: string;
  url: string;
  category: string;
  keywords: string[];
  description: string | null;
  reward_type: string;
  active: boolean;
}

export interface AffiliateBlockItem {
  program_id: number;
  title: string;
  url: string;
  description: string;
}

/**
 * 記事のカテゴリとキーワードから関連アフィリエイトプログラムを最大2件取得
 */
export async function matchAffiliatePrograms(
  category: string,
  articleKeyword: string,
  articleContent: string
): Promise<AffiliateBlockItem[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];

  // 1. 同カテゴリ or "all" カテゴリのアクティブなプログラムを取得
  const { data: programs, error } = await supabase
    .from("affiliate_programs")
    .select("*")
    .eq("active", true)
    .in("category", [category, "all"])
    .order("id");

  if (error || !programs || programs.length === 0) return [];

  // 2. キーワードマッチングでスコアリング
  const searchText = `${articleKeyword} ${articleContent}`.toLowerCase();
  const scored = (programs as AffiliateProgram[]).map((program) => {
    let score = 0;
    for (const kw of program.keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    // カテゴリ完全一致ボーナス
    if (program.category === category) {
      score += 0.5;
    }
    return { program, score };
  });

  // 3. スコア順でソート、上位2件を返す
  const top = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return top.map((s) => ({
    program_id: s.program.id,
    title: s.program.name,
    url: s.program.url,
    description: s.program.description || "",
  }));
}

/**
 * クリックを記録
 */
export async function trackClick(
  articleId: number,
  programId: number
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from("blog_affiliate_clicks").insert({
    article_id: articleId,
    program_id: programId,
  });
}
