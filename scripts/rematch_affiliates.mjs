/**
 * 全公開記事に対して affiliate_blocks を再マッチングしてUPDATE
 * - 記事本文(content_md)は変更しない
 * - 既存件数を上限として踏襲（0件の記事は最大3件まで埋める）
 * - category='all' のプログラム（楽天等）も候補に含まれる
 *
 * 使い方: node scripts/rematch_affiliates.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ 環境変数未設定");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

// 1. 全アクティブプログラム取得
const progRes = await fetch(
  `${SUPABASE_URL}/rest/v1/affiliate_programs?active=eq.true&select=*`,
  { headers }
);
const allPrograms = await progRes.json();
console.log(`📦 アクティブプログラム: ${allPrograms.length} 件（楽天含む）\n`);

// 2. 全公開記事取得
const artRes = await fetch(
  `${SUPABASE_URL}/rest/v1/blog_articles?status=eq.published&select=id,category,title,content_md,affiliate_blocks&order=id`,
  { headers }
);
const articles = await artRes.json();
console.log(`📝 対象記事: ${articles.length} 件\n`);

// 3. キーワード取得（keyword_idからは取れないのでtitleを代用）
function matchPrograms(category, title, contentMd, maxCount) {
  // 同カテゴリ or "all" のプログラムを候補にする
  const candidates = allPrograms.filter(
    (p) => p.category === category || p.category === "all"
  );

  const searchText = `${title} ${contentMd}`.toLowerCase();

  const scored = candidates.map((program) => {
    let score = 0;
    const keywords = program.keywords || [];
    for (const kw of keywords) {
      if (searchText.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    // カテゴリ完全一致ボーナス
    if (program.category === category) {
      score += 0.5;
    }
    // category='all' のジェネリックプログラムはスコアを0.7倍に抑制
    if (program.category === "all") {
      score *= 0.7;
    }
    return { program, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map((s) => ({
      program_id: s.program.id,
      title: s.program.name,
      url: s.program.url,
      description: s.program.description || "",
    }));
}

// 4. 各記事をリマッチ & UPDATE
let updatedCount = 0;
let rakutenInsertedCount = 0;
const results = [];

for (const article of articles) {
  const beforeCount = Array.isArray(article.affiliate_blocks)
    ? article.affiliate_blocks.length
    : 0;
  // 既存件数を踏襲、0件なら最大3件まで埋める
  const maxCount = beforeCount > 0 ? beforeCount : 3;

  const newBlocks = matchPrograms(
    article.category,
    article.title,
    article.content_md,
    maxCount
  );

  const afterCount = newBlocks.length;
  const hasRakuten = newBlocks.some((b) => b.title.includes("楽天"));

  // UPDATE
  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_articles?id=eq.${article.id}`,
    {
      method: "PATCH",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({
        affiliate_blocks: newBlocks.length > 0 ? newBlocks : null,
      }),
    }
  );

  if (!updateRes.ok) {
    console.error(`❌ id=${article.id} UPDATE失敗: ${await updateRes.text()}`);
    continue;
  }

  updatedCount++;
  if (hasRakuten) rakutenInsertedCount++;

  results.push({
    id: article.id,
    category: article.category,
    before: beforeCount,
    after: afterCount,
    rakuten: hasRakuten ? "✅" : "-",
    programs: newBlocks.map((b) => b.title).join(", "),
  });
}

// 5. レポート
console.log("=== リマッチ結果 ===\n");
console.log("id | category | Before | After | 楽天 | プログラム");
console.log("---|----------|--------|-------|------|----------");
for (const r of results) {
  console.log(
    `${r.id} | ${r.category} | ${r.before} | ${r.after} | ${r.rakuten} | ${r.programs.substring(0, 50)}`
  );
}
console.log("\n---");
console.log(`✅ 更新件数: ${updatedCount} / ${articles.length}`);
console.log(`🛒 楽天が挿入された記事数: ${rakutenInsertedCount}`);
