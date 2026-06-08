/**
 * A8.net 取得結果を Supabase affiliate_programs テーブルに投入
 *
 * 使い方:
 *   node scripts/a8_import_to_supabase.mjs scripts/a8_results.json
 *
 * 環境変数: .env.local から読み取り
 */
import { readFileSync } from "fs";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_URL or SERVICE_ROLE_KEY not set in .env.local");
  process.exit(1);
}

const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Usage: node scripts/a8_import_to_supabase.mjs <json_file>");
  process.exit(1);
}

// カテゴリ自動判定ルール
const CATEGORY_RULES = [
  { category: "world-food", keywords: ["海外", "輸入", "世界", "スパイス", "紅茶", "ティー", "KUSMI", "オリーブ", "ワイン", "チーズ", "エスニック", "韓国", "タイ", "インド", "ベトナム", "メキシコ", "イタリア", "フランス", "お取り寄せ", "グルメ", "食品", "食材"] },
  { category: "japan-culture", keywords: ["日本", "和", "伝統", "着物", "茶道", "抹茶", "おせち", "和食", "京都", "漆", "金継ぎ", "焼き物", "陶器", "日本酒", "甘酒", "発酵", "味噌", "醤油", "精肉", "肉", "お歳暮", "お中元", "ギフト"] },
  { category: "ai", keywords: ["VPN", "ガジェット", "SaaS", "AI", "プログラミング", "IT", "PC", "パソコン", "スマホ", "Wi-Fi", "レンタルサーバー", "ドメイン", "クラウド", "セキュリティ", "オフィス", "デジタル", "Tech", "IoT", "ロボット", "SwitchBot", "NordVPN", "ソフトウェア"] },
  { category: "health", keywords: ["サプリ", "健康", "ダイエット", "プロテイン", "ビタミン", "ミネラル", "腸活", "乳酸菌", "青汁", "酵素", "美容", "スキンケア", "フィットネス", "ジム", "ヨガ", "整体", "マッサージ", "睡眠", "枕", "マットレス", "コスメ", "化粧"] },
  { category: "sauna", keywords: ["サウナ", "温泉", "銭湯", "岩盤浴", "スパ", "入浴", "ととのい", "テントサウナ"] },
  { category: "coffee", keywords: ["コーヒー", "珈琲", "カフェ", "焙煎", "ドリップ", "エスプレッソ", "豆", "紅茶", "ティー", "茶", "ハーブティー"] },
  { category: "camp", keywords: ["キャンプ", "アウトドア", "テント", "焚き火", "登山", "ハイキング", "BBQ", "バーベキュー", "防災", "ポータブル電源", "ソーラー", "Jackery", "ランタン", "寝袋", "ナイフ", "レンタル"] },
];

function detectCategory(name, reward) {
  const text = `${name} ${reward}`.toLowerCase();
  let bestMatch = { category: "all", score: 0 };

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { category: rule.category, score };
    }
  }

  return bestMatch.category;
}

function extractKeywords(name, reward) {
  const text = `${name} ${reward}`;
  // プログラム名から主要キーワードを抽出（2文字以上の単語）
  const words = text
    .replace(/[【】「」『』（）\(\)\/・、。,.\-_:：]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 2 && w.length <= 20)
    .filter(w => !["プログラム", "アフィリエイト", "新規", "購入", "申込", "登録", "成果", "報酬", "承認", "確定", "プロモーション"].includes(w));

  // 重複排除して上位8個
  return [...new Set(words)].slice(0, 8);
}

function detectRewardType(reward) {
  if (!reward) return "percent";
  if (reward.includes("%")) return "percent";
  if (reward.includes("円")) return "fixed";
  return "percent";
}

// メイン処理
const rawData = JSON.parse(readFileSync(inputFile, "utf-8"));
console.log(`📂 ${rawData.length} 件のプログラムを読み込み\n`);

// 既存プログラムのURL一覧を取得
const existingRes = await fetch(
  `${SUPABASE_URL}/rest/v1/affiliate_programs?select=url`,
  {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  }
);
const existingPrograms = await existingRes.json();
const existingUrls = new Set(existingPrograms.map(p => p.url));
console.log(`📊 既存プログラム: ${existingUrls.size} 件\n`);

// 新規プログラムのみフィルタ
const newPrograms = rawData.filter(p => !existingUrls.has(p.url));
const skipped = rawData.length - newPrograms.length;
console.log(`⏭️  既存スキップ: ${skipped} 件`);
console.log(`🆕 新規投入対象: ${newPrograms.length} 件\n`);

if (newPrograms.length === 0) {
  console.log("✅ 新規プログラムはありません。");
  process.exit(0);
}

// INSERT用データ変換
const insertData = newPrograms.map(p => ({
  name: p.name.substring(0, 200),
  url: p.url,
  category: detectCategory(p.name, p.reward),
  keywords: extractKeywords(p.name, p.reward),
  description: p.reward || null,
  reward_type: detectRewardType(p.reward),
  active: true,
}));

// カテゴリ分布を表示
const catCount = {};
for (const p of insertData) {
  catCount[p.category] = (catCount[p.category] || 0) + 1;
}
console.log("📊 カテゴリ分布:");
for (const [cat, count] of Object.entries(catCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}
console.log();

// バッチ INSERT (50件ずつ)
let inserted = 0;
let errors = 0;
const BATCH_SIZE = 50;

for (let i = 0; i < insertData.length; i += BATCH_SIZE) {
  const batch = insertData.slice(i, i + BATCH_SIZE);

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/affiliate_programs`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(batch),
    }
  );

  if (res.ok) {
    const result = await res.json();
    inserted += result.length;
    console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} 件 INSERT`);
  } else {
    const errText = await res.text();
    errors += batch.length;
    console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} エラー: ${res.status} ${errText}`);
  }
}

console.log("\n========================================");
console.log("🎉 投入完了!");
console.log(`  取得件数: ${rawData.length}`);
console.log(`  新規追加: ${inserted}`);
console.log(`  既存スキップ: ${skipped}`);
console.log(`  エラー: ${errors}`);
console.log("========================================");

// 最終件数確認
const finalRes = await fetch(
  `${SUPABASE_URL}/rest/v1/affiliate_programs?select=id&active=eq.true`,
  {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  }
);
const finalData = await finalRes.json();
console.log(`\n📊 affiliate_programs 合計 (active=true): ${finalData.length} 件`);

// 高単価プログラム TOP10（新規追加分から）
console.log("\n🏆 新規追加の主要プログラム:");
for (const p of newPrograms.slice(0, 10)) {
  console.log(`  - ${p.name.substring(0, 40)} | EPC: ${p.epc} | ${p.reward?.substring(0, 30) || ""}`);
}
