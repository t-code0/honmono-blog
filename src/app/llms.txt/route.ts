import { CATEGORIES, HONMONO_APPS, SITE_URL } from "@/lib/constants";

export async function GET() {
  const categories = CATEGORIES.map(
    (c) => `- ${c.nameJa} (${c.nameEn}): ${c.catchcopy} → ${SITE_URL}/ja/${c.slug}/`
  ).join("\n");

  const apps = HONMONO_APPS.map(
    (a) => `- ${a.name}: ${a.description} → ${a.url}`
  ).join("\n");

  const content = `# HONMONOブログ
> AIが毎日深掘りするニッチな知識の宝庫

## About
HONMONOブログは、世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプの7カテゴリについて、
AIが毎日1記事ずつ深掘りしてお届けするブログメディアです。
ニッチだけど確かな知識を、エビデンスと出典付きで提供します。

## Categories
${categories}

## HONMONO Series (Related Apps)
${apps}

## URL Structure
- Top: ${SITE_URL}/[lang]/
- Category: ${SITE_URL}/[lang]/[category]/
- Article: ${SITE_URL}/[lang]/[category]/[slug]/
- Languages: ja (Japanese), en (English)

## Contact
Website: ${SITE_URL}
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
