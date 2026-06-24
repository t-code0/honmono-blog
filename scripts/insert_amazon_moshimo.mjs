/**
 * Amazon.co.jp（もしも経由）アフィリエイトプログラムを affiliate_programs に追加
 *
 * 使い方: node scripts/insert_amazon_moshimo.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_URL or SERVICE_ROLE_KEY not set in .env.local");
  process.exit(1);
}

const AMAZON_PROGRAM = {
  name: "Amazon.co.jp（もしも経由）",
  url: "https://af.moshimo.com/af/c/click?a_id=5625533&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2F",
  category: "all",
  keywords: ["Amazon", "アマゾン", "買い物", "ショッピング", "通販", "購入", "レビュー", "おすすめ", "商品"],
  description: "購入1.8% + Prime無料体験450円",
  reward_type: "percent",
  active: true,
  source: "moshimo",
  epc: 0,
};

// 重複チェック（URLベース）
const checkRes = await fetch(
  `${SUPABASE_URL}/rest/v1/affiliate_programs?url=eq.${encodeURIComponent(AMAZON_PROGRAM.url)}&select=id,name`,
  {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  }
);
const existing = await checkRes.json();

if (existing.length > 0) {
  console.log(`⏭️  既に存在します: id=${existing[0].id} "${existing[0].name}"`);
  process.exit(0);
}

// INSERT
const res = await fetch(`${SUPABASE_URL}/rest/v1/affiliate_programs`, {
  method: "POST",
  headers: {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(AMAZON_PROGRAM),
});

if (!res.ok) {
  const errText = await res.text();
  console.error(`❌ INSERT失敗: ${res.status} ${errText}`);
  process.exit(1);
}

const inserted = await res.json();
console.log(`✅ Amazon.co.jp（もしも経由）を追加しました`);
console.log(`   id: ${inserted[0].id}`);
console.log(`   name: ${inserted[0].name}`);
console.log(`   category: ${inserted[0].category}`);
console.log(`   source: ${inserted[0].source}`);

// 確認クエリ: source='moshimo' の全プログラム
const verifyRes = await fetch(
  `${SUPABASE_URL}/rest/v1/affiliate_programs?source=eq.moshimo&select=name,source,category,active,description`,
  {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  }
);
const verifyData = await verifyRes.json();
console.log(`\n📊 source='moshimo' のプログラム一覧:`);
for (const p of verifyData) {
  console.log(`  - ${p.name} | category: ${p.category} | active: ${p.active} | ${p.description}`);
}
