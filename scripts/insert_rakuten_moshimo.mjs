/**
 * 楽天市場（もしも経由）アフィリエイトプログラムを affiliate_programs に追加
 *
 * 前提: source カラムが ALTER TABLE で追加済みであること
 * 使い方: node scripts/insert_rakuten_moshimo.mjs
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_URL or SERVICE_ROLE_KEY not set in .env.local");
  process.exit(1);
}

const RAKUTEN_PROGRAM = {
  name: "楽天市場（もしも経由）",
  url: "https://af.moshimo.com/af/c/click?a_id=5624893&p_id=54&pc_id=54&pl_id=616&url=http%3A%2F%2Fwww.rakuten.co.jp%2F",
  category: "all",
  keywords: ["楽天", "楽天市場", "買い物", "ショッピング", "通販", "ポイント", "セール", "お買い物マラソン"],
  description: "購入2%",
  reward_type: "percent",
  active: true,
  source: "moshimo",
  epc: 0,
};

// 重複チェック（URLベース）
const checkRes = await fetch(
  `${SUPABASE_URL}/rest/v1/affiliate_programs?url=eq.${encodeURIComponent(RAKUTEN_PROGRAM.url)}&select=id,name`,
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
  body: JSON.stringify(RAKUTEN_PROGRAM),
});

if (!res.ok) {
  const errText = await res.text();
  console.error(`❌ INSERT失敗: ${res.status} ${errText}`);
  process.exit(1);
}

const inserted = await res.json();
console.log(`✅ 楽天市場（もしも経由）を追加しました`);
console.log(`   id: ${inserted[0].id}`);
console.log(`   name: ${inserted[0].name}`);
console.log(`   category: ${inserted[0].category}`);
console.log(`   source: ${inserted[0].source}`);

// 確認クエリ
const verifyRes = await fetch(
  `${SUPABASE_URL}/rest/v1/affiliate_programs?source=eq.moshimo&select=name,source,category,active`,
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
  console.log(`  - ${p.name} | category: ${p.category} | active: ${p.active}`);
}
