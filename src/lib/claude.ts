import Anthropic from "@anthropic-ai/sdk";
import { getServiceClient } from "./supabase";
import { HONMONO_APPS, CATEGORIES, getCategoryBySlug } from "./constants";
import { matchAffiliatePrograms } from "./affiliates";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 6000;
// Haiku pricing: $0.80/1M input, $4.00/1M output
const INPUT_COST_PER_TOKEN = 0.80 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 4.00 / 1_000_000;
const USD_TO_JPY = 150;

interface KeywordRow {
  id: number;
  keyword: string;
  category: string;
  search_intent: string;
  affiliate_links: Record<string, unknown> | null;
}

interface GenerationResult {
  slug: string;
  title: string;
  description: string;
  contentMd: string;
  toc: { level: number; text: string; id: string }[];
  category: string;
  keywordId: number;
  inputTokens: number;
  outputTokens: number;
  costJpy: number;
  durationMs: number;
}

function buildPrompt(keyword: KeywordRow): string {
  const category = getCategoryBySlug(keyword.category);
  const categoryName = category?.nameJa || keyword.category;

  const otherCategories = CATEGORIES.filter((c) => c.slug !== keyword.category)
    .map((c) => `${c.emoji} ${c.nameJa}（/ja/${c.slug}/）`)
    .join("\n");

  const appLinks = HONMONO_APPS.map(
    (app) => `- ${app.emoji} [${app.name}](${app.url}): ${app.description}`
  ).join("\n");

  return `あなたはHONMONOブログの専門ライターです。「${categoryName}」カテゴリの記事を執筆します。

## 執筆テーマ
「${keyword.keyword}」

## 記事タイプ
${keyword.search_intent}（${getIntentDescription(keyword.search_intent)}）

## 出力形式
以下の構成でMarkdown形式の記事を出力してください：

1. **編集メモ**（120字程度）: 冒頭に「> **編集メモ:** 」で始まる引用ブロック。この記事のテーマについて、なぜ読む価値があるのか、どのような情報源を参考にしたかを簡潔に述べる（E-E-A-T対策）。

2. **H1タイトル**: SEOに最適化された魅力的なタイトル（# で記述）

3. **リード文**: 2〜3文でテーマの概要と読者のメリットを提示

4. **目次**: 自動生成されるため記述不要

5. **H2セクション5〜7本**: 各セクション300〜800字。以下を含める：
   - 具体的な事実・データ（出典明記）
   - 独自の考察・分析
   - 適切な場所に「※諸説あり」「※個人の見解を含みます」を挿入

6. **まとめ**: 要点を箇条書き3〜5項目

7. **関連リンク**: 以下の形式で
   - HONMONOブログの他カテゴリへの誘導
   - 既存HONMONOアプリへの誘導

## 外部リンク・出典
- 信頼性の高い情報源（政府機関、学術論文、公式サイト等）へのリンクを各セクションに最低1つ含める
- リンクテキストは具体的に（「こちら」「ここ」は禁止）

## 関連カテゴリ一覧
${otherCategories}

## HONMONOアプリ紹介（記事末尾に自然に誘導）
${appLinks}

## 禁止事項（厳守）
- 医療効果の断定表現（「〜が治る」「〜に効く」は禁止。「〜の可能性が示唆されている」等の表現を使用）
- 個人名・ブランド名の中傷
- 著作物の無断引用（パブリックドメイン除く）
- 「最新の〜」「今年の〜」等の時間経過で陳腐化する表現
- 根拠のない数字や統計

## 文字数
3,000〜5,000字（Markdown込み）

## 出力
Markdownテキストのみを出力してください。メタ情報やJSON等は不要です。`;
}

function getIntentDescription(intent: string): string {
  const map: Record<string, string> = {
    review: "レビュー・体験記型。実体験に基づく詳細な評価と分析",
    comparison: "比較型。複数の選択肢を客観的に比較検討",
    howto: "ハウツー型。具体的な手順やノウハウを提供",
    list: "まとめ・リスト型。テーマに沿った項目を網羅的に紹介",
    explainer: "解説型。テーマの背景・仕組み・意義を深掘り",
  };
  return map[intent] || "一般的な解説記事";
}

function extractToc(markdown: string): { level: number; text: string; id: string }[] {
  const toc: { level: number; text: string; id: string }[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\u3000-\u9fff\uff00-\uffef]+/g, "-")
        .replace(/^-|-$/g, "");
      toc.push({ level, text, id });
    }
  }
  return toc;
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "無題の記事";
}

function extractDescription(markdown: string): string {
  const lines = markdown.split("\n");
  let foundH1 = false;
  for (const line of lines) {
    if (line.startsWith("# ")) {
      foundH1 = true;
      continue;
    }
    if (foundH1 && line.trim().length > 0 && !line.startsWith("#") && !line.startsWith(">")) {
      return line.trim().slice(0, 160);
    }
  }
  return "";
}

function generateSlug(category: string, keyword: string): string {
  const timestamp = Date.now().toString(36);
  // Extract ASCII words from keyword (e.g. "Claude Code", "Cursor")
  const asciiWords = keyword
    .match(/[a-zA-Z0-9]+/g)
    ?.slice(0, 4)
    .join("-")
    .toLowerCase();
  const base = asciiWords && asciiWords.length > 3
    ? `${category}-${asciiWords}`
    : `${category}-${timestamp}`;
  return `${base}-${timestamp}`;
}

export async function generateArticle(): Promise<GenerationResult> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error("Supabase service client not available");

  // 1. Get a pending keyword
  const { data: keyword, error: kwError } = await supabase
    .from("blog_keywords")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: true })
    .limit(1)
    .single();

  if (kwError || !keyword) {
    throw new Error(`No pending keywords found: ${kwError?.message || "empty"}`);
  }

  const kw = keyword as KeywordRow;

  // 2. Mark as generating
  await supabase
    .from("blog_keywords")
    .update({ status: "generating" })
    .eq("id", kw.id);

  const startTime = Date.now();

  try {
    // 3. Call Claude Haiku
    const client = new Anthropic();
    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: buildPrompt(kw),
        },
      ],
    });

    const contentMd =
      response.content[0].type === "text" ? response.content[0].text : "";
    const durationMs = Date.now() - startTime;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costUsd =
      inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
    const costJpy = Math.round(costUsd * USD_TO_JPY * 10000) / 10000;

    const title = extractTitle(contentMd);
    const description = extractDescription(contentMd);
    const toc = extractToc(contentMd);
    const slug = generateSlug(kw.category, kw.keyword);

    // 4. Match affiliate programs
    const affiliateBlocks = await matchAffiliatePrograms(
      kw.category,
      kw.keyword,
      contentMd
    );

    // 5. Save article
    const { error: articleError } = await supabase.from("blog_articles").insert({
      slug,
      keyword_id: kw.id,
      category: kw.category,
      title,
      description,
      content_md: contentMd,
      toc,
      affiliate_blocks: affiliateBlocks.length > 0 ? affiliateBlocks : null,
      status: "published",
      published_at: new Date().toISOString(),
    });

    if (articleError) throw new Error(`Failed to save article: ${articleError.message}`);

    // 5. Update keyword status
    await supabase
      .from("blog_keywords")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", kw.id);

    // 6. Log generation
    await supabase.from("blog_generation_logs").insert({
      keyword_id: kw.id,
      model: HAIKU_MODEL,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_jpy: costJpy,
      duration_ms: durationMs,
      error: null,
    });

    return {
      slug,
      title,
      description,
      contentMd,
      toc,
      category: kw.category,
      keywordId: kw.id,
      inputTokens,
      outputTokens,
      costJpy,
      durationMs,
    };
  } catch (error) {
    // Mark as failed and log
    await supabase
      .from("blog_keywords")
      .update({ status: "failed" })
      .eq("id", kw.id);

    const durationMs = Date.now() - startTime;
    await supabase.from("blog_generation_logs").insert({
      keyword_id: kw.id,
      model: HAIKU_MODEL,
      input_tokens: 0,
      output_tokens: 0,
      cost_jpy: 0,
      duration_ms: durationMs,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}
