/**
 * 記事本文中に他記事への内部リンクを自動挿入するスクリプト
 *
 * ロジック:
 * 1. 全公開記事の title, slug, category を取得
 * 2. 各記事タイトルから主要キーワード（2文字以上の名詞的語）を抽出
 * 3. 各記事の content_md 中で他記事のキーワードを検出
 * 4. 同一記事内では同キーワードの最初の1回のみリンク化
 * 5. 既存リンク内（[...](...)）やアフィリエイトリンクは除外
 *
 * 使い方: node scripts/inject_internal_links.mjs
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

// 除外語（一般的すぎるもの）
const STOP_WORDS = new Set([
  "について", "おすすめ", "まとめ", "ガイド", "入門", "基本", "方法",
  "とは", "完全", "徹底", "解説", "紹介", "ランキング", "比較",
  "最新", "初心者", "プロ", "実践", "効果", "メリット", "デメリット",
  "ポイント", "コツ", "選び方", "使い方", "やり方", "作り方",
  "知識", "世界", "日本", "本当", "歴史", "文化", "科学",
]);

// 1. 全公開記事を取得
const artRes = await fetch(
  `${SUPABASE_URL}/rest/v1/blog_articles?status=eq.published&select=id,title,slug,category,content_md&order=id`,
  { headers }
);
const articles = await artRes.json();
console.log(`📝 対象記事: ${articles.length} 件\n`);

// 2. 各記事からキーワードを抽出
function extractKeywords(title) {
  const cleaned = title
    .replace(/[【】「」『』（）\(\)\/・、。,.\-_:：！？!?〜～]/g, " ")
    .replace(/\d+/g, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2 && w.length <= 15);
  return words.filter((w) => !STOP_WORDS.has(w));
}

// 各記事のキーワードマップを作成
const articleKeywords = articles.map((a) => ({
  id: a.id,
  slug: a.slug,
  category: a.category,
  title: a.title,
  keywords: extractKeywords(a.title),
}));

// 3. 各記事に対して内部リンクを挿入
let totalLinksInserted = 0;
let articlesModified = 0;
const results = [];

for (const article of articles) {
  let content = article.content_md;
  let linksInserted = 0;
  const linkedKeywords = new Set();

  // 他の記事のキーワードをチェック
  for (const other of articleKeywords) {
    if (other.id === article.id) continue; // 自分自身はスキップ

    for (const keyword of other.keywords) {
      if (linkedKeywords.has(keyword)) continue; // 同キーワードの2回目以降はスキップ
      if (keyword.length < 3) continue; // 3文字未満はスキップ（精度向上）

      // content内にキーワードが存在するか確認
      const keywordIndex = content.indexOf(keyword);
      if (keywordIndex === -1) continue;

      // 既存リンク内かどうか確認
      // [...keyword...](...) や [text](url) 内のテキストは除外
      if (isInsideLink(content, keywordIndex)) continue;

      // MarkdownのヘッダーH1/H2/H3行内は除外
      if (isInsideHeader(content, keywordIndex)) continue;

      // リンクを挿入（最初の1回のみ）
      const linkUrl = `/ja/${other.category}/${other.slug}`;
      const linkMd = `[${keyword}](${linkUrl})`;
      content =
        content.substring(0, keywordIndex) +
        linkMd +
        content.substring(keywordIndex + keyword.length);

      linkedKeywords.add(keyword);
      linksInserted++;

      // 1記事あたり最大5リンクまで
      if (linksInserted >= 5) break;
    }
    if (linksInserted >= 5) break;
  }

  if (linksInserted > 0) {
    // UPDATE
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_articles?id=eq.${article.id}`,
      {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ content_md: content }),
      }
    );
    if (updateRes.ok) {
      articlesModified++;
      totalLinksInserted += linksInserted;
    } else {
      console.error(`❌ id=${article.id} UPDATE失敗`);
    }
  }

  results.push({
    id: article.id,
    category: article.category,
    title: article.title.substring(0, 30),
    links: linksInserted,
  });
}

// レポート
console.log("=== 内部リンク挿入結果 ===\n");
console.log("id | category | links | title");
console.log("---|----------|-------|------");
for (const r of results) {
  console.log(`${r.id} | ${r.category} | ${r.links} | ${r.title}`);
}
console.log(`\n---`);
console.log(`✅ 変更記事数: ${articlesModified} / ${articles.length}`);
console.log(`🔗 挿入リンク総数: ${totalLinksInserted}`);

// ─── ヘルパー関数 ───

function isInsideLink(text, index) {
  // index の位置から後方を見て ] が来る前に [ が来れば、リンクテキスト内の可能性
  // より確実に: 前後のコンテキストでMarkdownリンク内かチェック
  const before = text.substring(Math.max(0, index - 200), index);
  const after = text.substring(index, Math.min(text.length, index + 200));

  // パターン1: [... の中にいる（](...) が後ろにある）
  const lastOpenBracket = before.lastIndexOf("[");
  const lastCloseBracket = before.lastIndexOf("]");
  if (lastOpenBracket > lastCloseBracket) {
    // 開き括弧の中にいる可能性
    const closingBracketPos = after.indexOf("]");
    if (closingBracketPos !== -1) {
      const afterClose = after.substring(closingBracketPos);
      if (afterClose.startsWith("](")) return true;
    }
  }

  // パターン2: ](url) の url 部分にいる
  const lastParen = before.lastIndexOf("](");
  if (lastParen !== -1) {
    const closeParenAfter = text.indexOf(")", lastParen + index - before.length);
    if (closeParenAfter > index) return true;
  }

  return false;
}

function isInsideHeader(text, index) {
  // キーワードの位置から行頭を探して # で始まるか確認
  const lineStart = text.lastIndexOf("\n", index - 1) + 1;
  const lineContent = text.substring(lineStart, index);
  return /^#{1,3}\s/.test(lineContent);
}
