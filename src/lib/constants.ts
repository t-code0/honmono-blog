export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://honmono-blog.vercel.app";
export const ADSENSE_PUB_ID = process.env.ADSENSE_PUB_ID || "pub-8285912744304653";

// Phase2で true にして多言語有効化
export const ENABLE_I18N = process.env.NEXT_PUBLIC_ENABLE_I18N === "true";

export const SUPPORTED_LANGS = ["ja", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const ACTIVE_LANGS: readonly Lang[] = ENABLE_I18N ? SUPPORTED_LANGS : ["ja"];

export interface Category {
  slug: string;
  nameJa: string;
  nameEn: string;
  catchcopy: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "world-food",
    nameJa: "世界の食卓探訪",
    nameEn: "World Food Explorer",
    catchcopy: "まだ見ぬ味覚の旅へ",
    emoji: "🌍",
  },
  {
    slug: "japan-culture",
    nameJa: "ニッポン再発見",
    nameEn: "Rediscover Japan",
    catchcopy: "知られざる伝統と文化の深層",
    emoji: "🏯",
  },
  {
    slug: "ai",
    nameJa: "AI実践ラボ",
    nameEn: "AI Practical Lab",
    catchcopy: "使って分かるAIの本質",
    emoji: "🤖",
  },
  {
    slug: "health",
    nameJa: "カラダの本音",
    nameEn: "Body Honesty",
    catchcopy: "エビデンスで読み解く健康の真実",
    emoji: "💪",
  },
  {
    slug: "sauna",
    nameJa: "ととのい研究所",
    nameEn: "Sauna Research Lab",
    catchcopy: "科学とサウナの交差点",
    emoji: "🧖",
  },
  {
    slug: "coffee",
    nameJa: "珈琲深煎り帖",
    nameEn: "Deep Roast Coffee",
    catchcopy: "一杯の奥にある物語",
    emoji: "☕",
  },
  {
    slug: "camp",
    nameJa: "野営の流儀",
    nameEn: "Camp Philosophy",
    catchcopy: "自然と向き合う大人の遊び",
    emoji: "🏕️",
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string, lang: Lang): string {
  const cat = getCategoryBySlug(slug);
  if (!cat) return slug;
  return lang === "ja" ? cat.nameJa : cat.nameEn;
}

// 既存5アプリへの内部リンク
export const HONMONO_APPS = [
  {
    name: "添加物図鑑",
    url: "https://tenkabutsu-zukan.vercel.app",
    description: "食品添加物の危険度をAIが分析。安全な食品選びの味方。",
    emoji: "🔍",
  },
  {
    name: "栄養図鑑",
    url: "https://eiyo-zukan.vercel.app",
    description: "栄養成分をPubMed論文付きで徹底解説。科学的な栄養管理。",
    emoji: "📊",
  },
  {
    name: "蒸され人",
    url: "https://musarebito.vercel.app",
    description: "サウナ施設をAIが分析。ととのい度スコアで穴場を発見。",
    emoji: "🧖",
  },
  {
    name: "リタマ",
    url: "https://ritama.vercel.app",
    description: "口コミをAI分析して本物のお店を発見。本物スコアで信頼度が一目瞭然。",
    emoji: "📍",
  },
];

// 記事生成の search_intent タイプ
export type SearchIntent = "review" | "comparison" | "howto" | "list" | "explainer";
