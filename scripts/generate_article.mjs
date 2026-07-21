/**
 * generate_article.mjs - Claude Codeサブスク枠を使った記事生成
 *
 * Usage:
 *   node scripts/generate_article.mjs [--dry-run] [--count 1] [--model sonnet]
 *
 * 従来の src/lib/claude.ts は @anthropic-ai/sdk（API従量課金）を使っていたが、
 * こちらは claude CLI のヘッドレスモード（claude -p）を使うため API課金は発生しない。
 *
 * 【重要】claude CLI に ANTHROPIC_API_KEY が渡ると従量課金APIに切り替わってしまう。
 * .env.local に ANTHROPIC_API_KEY が入っているため、子プロセスの環境変数から
 * 明示的に削除している（buildChildEnv 参照）。ここは絶対に変更しないこと。
 *
 * 記事は status='draft' で保存され、人間が承認するまで公開されない。
 * 公開導線は scripts/sql/blog_keyword_queue.sql のセクション3を参照。
 */

import { spawn } from "node:child_process";
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = dirname(SCRIPT_DIR);
const LOG_DIR = join(SCRIPT_DIR, "logs");
const DRAFT_DIR = join(SCRIPT_DIR, "drafts");

dotenv.config({ path: join(PROJECT_ROOT, ".env.local"), quiet: true });

const DEFAULT_MODEL = "sonnet";
const TONE_SAMPLE_COUNT = 3;
const CLAUDE_TIMEOUT_MS = 10 * 60 * 1000;

// ---------------------------------------------------------------- logging

let logFilePath = null;

/** ローカル時刻。toISOString() はUTCになりラッパー(PowerShell)とファイル名がズレる */
function localParts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
  };
}

async function log(msg) {
  const { date, time } = localParts();
  const line = `[${date} ${time}] ${msg}`;
  console.log(line);
  if (logFilePath) await appendFile(logFilePath, line + "\n", "utf8");
}

// ---------------------------------------------------------------- claude CLI

/**
 * claude CLI に渡す環境変数を作る。
 * ANTHROPIC_API_KEY 系を削除してサブスク認証を強制する。
 */
function buildChildEnv() {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  delete env.ANTHROPIC_BASE_URL;
  return env;
}

function runClaude(prompt, model) {
  return new Promise((resolve, reject) => {
    // Windows では claude が .cmd シムのため shell 経由でないと起動できない。
    // 引数配列 + shell:true は Node が非推奨警告を出すので、コマンド文字列で渡す。
    // model は呼び出し側が決める固定値のみ（外部入力ではない）。
    const safeModel = String(model).replace(/[^a-zA-Z0-9._-]/g, "");
    const child = spawn(`claude -p --model ${safeModel}`, {
      env: buildChildEnv(),
      shell: true,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`claude CLI timed out after ${CLAUDE_TIMEOUT_MS}ms`));
    }, CLAUDE_TIMEOUT_MS);

    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`claude CLI exited ${code}: ${stderr.slice(0, 500)}`));
      } else {
        resolve(stdout.trim());
      }
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// ---------------------------------------------------------------- parsing
// src/lib/claude.ts と同じ規則。記事の見た目を既存記事と揃えるため。

function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "無題の記事";
}

function extractDescription(md) {
  const lines = md.split("\n");
  let foundH1 = false;
  for (const line of lines) {
    if (line.startsWith("# ")) {
      foundH1 = true;
      continue;
    }
    if (foundH1 && line.trim() && !line.startsWith("#") && !line.startsWith(">")) {
      return line.trim().slice(0, 160);
    }
  }
  return "";
}

function extractToc(md) {
  const toc = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (!m) continue;
    const text = m[2].trim();
    toc.push({
      level: m[1].length,
      text,
      id: text
        .toLowerCase()
        .replace(/[^\w　-鿿＀-￯]+/g, "-")
        .replace(/^-|-$/g, ""),
    });
  }
  return toc;
}

function generateSlug(category, keyword) {
  // src/lib/claude.ts の実装は ASCII語が無いと timestamp が2回付いて
  // "coffee-xxxx-xxxx" になるため、ここでは重複しないようにしている
  const timestamp = Date.now().toString(36);
  const ascii = keyword
    .match(/[a-zA-Z0-9]+/g)
    ?.slice(0, 4)
    .join("-")
    .toLowerCase();
  return ascii && ascii.length > 3
    ? `${category}-${ascii}-${timestamp}`
    : `${category}-${timestamp}`;
}

/** claude CLI が前置きを付けた場合に備え、最初の見出しから切り出す */
function cleanMarkdown(raw) {
  const fenced = raw.match(/```(?:markdown|md)?\n([\s\S]*?)```/);
  let text = fenced ? fenced[1] : raw;
  const start = text.search(/^(>\s*\*\*編集メモ|#\s)/m);
  return (start > 0 ? text.slice(start) : text).trim();
}

// ---------------------------------------------------------------- prompt

function buildPrompt(keyword, toneSamples) {
  const intentMap = {
    review: "レビュー・体験記型。実体験に基づく詳細な評価と分析",
    comparison: "比較型。複数の選択肢を客観的に比較検討",
    howto: "ハウツー型。具体的な手順やノウハウを提供",
    list: "まとめ・リスト型。テーマに沿った項目を網羅的に紹介",
    explainer: "解説型。テーマの背景・仕組み・意義を深掘り",
  };

  const samples = toneSamples
    .map((a, i) => `### 既存記事サンプル${i + 1}: ${a.title}\n${a.content_md.slice(0, 1200)}`)
    .join("\n\n");

  return `あなたはHONMONOブログの専門ライターです。以下のテーマで記事を1本書いてください。

## 執筆テーマ
「${keyword.keyword}」

## カテゴリ
${keyword.category}

## 記事タイプ
${keyword.search_intent}（${intentMap[keyword.search_intent] || "一般的な解説記事"}）

## 文体の参考（既存記事の冒頭）
以下は同じブログの既存記事です。語り口・敬体・見出しの付け方・
「※諸説あり」等の注記の入れ方を揃えてください。内容は真似しないこと。

${samples}

## 出力構成
1. **編集メモ**（120字程度）: 冒頭に「> **編集メモ:** 」で始まる引用ブロック。
   なぜ読む価値があるか、どんな情報源を参考にしたかを述べる（E-E-A-T対策）。
2. **H1タイトル**: SEOに最適化された具体的なタイトル（# で記述）
3. **リード文**: 2〜3文でテーマの概要と読者のメリット
4. **H2セクション6〜7本**: 各セクション必ず400字以上。箇条書きだけで終わらせず、
   箇条書きの後に必ず2〜3文の解説を続ける。具体的な事実・データ（出典明記）と
   独自の考察を含める
5. **まとめ**: 要点を箇条書き3〜5項目
6. **アフィリエイト挿入位置の提案**: 記事の最後に必ず以下の形式で付ける。
   リンクそのものは書かず、位置と商材カテゴリの提案のみ。

<!-- AFFILIATE_SUGGESTIONS
- 見出し「（該当H2の見出し文）」の直後: （商材カテゴリと、なぜそこが適切かの理由を1行）
- 見出し「（該当H2の見出し文）」の直後: （同上）
-->

## 外部リンク・出典
- 信頼性の高い情報源（政府機関、学術論文、公式サイト等）へのリンクを各セクションに最低1つ
- リンクテキストは具体的に（「こちら」「ここ」は禁止）

## 禁止事項（厳守）
- 医療効果の断定表現（「〜が治る」「〜に効く」は禁止。「〜の可能性が示唆されている」等を使う）
- 個人名・ブランド名の中傷
- 著作物の無断引用
- 「最新の〜」「今年の〜」等の時間経過で陳腐化する表現
- 根拠のない数字や統計

## 文字数（重要）
本文全体で3,000字以上。2,500字を下回るものは不合格として扱われます。
各H2セクションを400字以上書けば自然に到達します。短くまとめようとしないこと。

## 出力
Markdownテキストのみを出力してください。前置きや説明文、JSONは一切不要です。`;
}

// ---------------------------------------------------------------- supabase

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が .env.local にありません"
    );
  }
  return createClient(url, key);
}

/**
 * キーワードを消費済みにする。'used' を試し、CHECK制約で弾かれたら
 * 'published' にフォールバックする（DDL未適用でも動かすため）。
 */
async function markKeywordConsumed(supabase, keywordId) {
  const payload = { published_at: new Date().toISOString() };
  const first = await supabase
    .from("blog_keywords")
    .update({ ...payload, status: "used" })
    .eq("id", keywordId);
  if (!first.error) return "used";

  const second = await supabase
    .from("blog_keywords")
    .update({ ...payload, status: "published" })
    .eq("id", keywordId);
  if (second.error) throw new Error(`キーワード更新に失敗: ${second.error.message}`);
  return "published";
}

// ---------------------------------------------------------------- main

async function generateOne(supabase, model, dryRun) {
  // 1. pending キーワードを優先度順に1件取得
  const { data: keyword, error: kwError } = await supabase
    .from("blog_keywords")
    .select("id, keyword, category, search_intent")
    .eq("status", "pending")
    .order("priority", { ascending: true })
    .limit(1)
    .single();

  if (kwError || !keyword) {
    throw new Error(`pending キーワードがありません: ${kwError?.message || "empty"}`);
  }
  await log(`キーワード: [${keyword.category}] ${keyword.keyword} (id=${keyword.id})`);

  // 2. 文体参考用に既存記事を数本読む
  const { data: samples } = await supabase
    .from("blog_articles")
    .select("title, content_md")
    .eq("category", keyword.category)
    .eq("status", "published")
    .order("id", { ascending: false })
    .limit(TONE_SAMPLE_COUNT);

  const toneSamples = samples || [];
  await log(`文体サンプル: ${toneSamples.length}件（同カテゴリの既存記事）`);

  // 3. claude CLI（サブスク枠）で生成
  const prompt = buildPrompt(keyword, toneSamples);
  await log(`claude -p 実行中 (model=${model}, prompt=${prompt.length}字) ...`);

  const started = Date.now();
  const raw = await runClaude(prompt, model);
  const durationMs = Date.now() - started;
  const contentMd = cleanMarkdown(raw);

  const title = extractTitle(contentMd);
  const description = extractDescription(contentMd);
  const toc = extractToc(contentMd);
  const slug = generateSlug(keyword.category, keyword.keyword);

  await log(
    `生成完了: ${contentMd.length}字, H2/H3=${toc.length}本, ${(durationMs / 1000).toFixed(1)}s`
  );
  await log(`タイトル: ${title}`);

  // 明らかに壊れた出力は保存しない。字数不足は警告のみ（人間が下書きで判断する）
  if (contentMd.length < 1500) {
    throw new Error(`生成結果が短すぎます (${contentMd.length}字)。保存を中止しました`);
  }
  if (toc.length < 3) {
    throw new Error(`見出しが少なすぎます (${toc.length}本)。保存を中止しました`);
  }
  if (contentMd.length < 2500) {
    await log(`警告: 目標3000字に対し ${contentMd.length}字。下書きで内容を確認してください`);
  }

  // 4. ローカルにも下書きを書き出す（人間がエディタで読めるように）
  await mkdir(DRAFT_DIR, { recursive: true });
  const draftPath = join(DRAFT_DIR, `${slug}.md`);
  await writeFile(draftPath, contentMd, "utf8");
  await log(`下書き保存: ${draftPath}`);

  if (dryRun) {
    await log("DRY-RUN: Supabaseへの書き込みをスキップしました");
    return { slug, title, dryRun: true };
  }

  // 5. status='draft' でINSERT（公開はしない）
  const { data: inserted, error: insertError } = await supabase
    .from("blog_articles")
    .insert({
      slug,
      keyword_id: keyword.id,
      category: keyword.category,
      title,
      description,
      content_md: contentMd,
      toc,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError) throw new Error(`記事の保存に失敗: ${insertError.message}`);
  await log(`Supabase保存: blog_articles.id=${inserted.id} status=draft`);

  // 6. キーワードを消費済みに
  const consumed = await markKeywordConsumed(supabase, keyword.id);
  await log(`キーワード更新: status=${consumed}`);

  // 7. 生成ログ（コストは0円。サブスク枠のため）
  await supabase.from("blog_generation_logs").insert({
    keyword_id: keyword.id,
    model: `claude-cli:${model}`,
    input_tokens: 0,
    output_tokens: 0,
    cost_jpy: 0,
    duration_ms: durationMs,
    error: null,
  });

  return { slug, title, articleId: inserted.id, durationMs };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const model =
    args.includes("--model") ? args[args.indexOf("--model") + 1] : DEFAULT_MODEL;
  const count = args.includes("--count")
    ? parseInt(args[args.indexOf("--count") + 1], 10) || 1
    : 1;

  await mkdir(LOG_DIR, { recursive: true });
  logFilePath = join(LOG_DIR, `${localParts().date}.log`);

  await log("=".repeat(60));
  await log(`開始 model=${model} count=${count} dryRun=${dryRun}`);

  if (process.env.ANTHROPIC_API_KEY) {
    await log("注意: ANTHROPIC_API_KEY が環境に存在しますが、claude CLI には渡しません（サブスク枠を使用）");
  }

  const supabase = getClient();
  let ok = 0;
  let ng = 0;

  for (let i = 0; i < count; i++) {
    await log(`--- ${i + 1}/${count} ---`);
    try {
      const r = await generateOne(supabase, model, dryRun);
      await log(`成功: ${r.slug}`);
      ok++;
    } catch (e) {
      await log(`失敗: ${e.message}`);
      ng++;
      if (e.message.includes("pending キーワードがありません")) break;
    }
  }

  await log(`結果: 成功=${ok} 失敗=${ng}`);
  process.exit(ng > 0 && ok === 0 ? 1 : 0);
}

main().catch(async (e) => {
  await log(`FATAL: ${e.message}`);
  process.exit(1);
});
