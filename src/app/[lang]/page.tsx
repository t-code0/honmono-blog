import { type Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { InternalLinks } from "@/components/InternalLinks";
import { CATEGORIES, SITE_URL, ENABLE_I18N, type Lang } from "@/lib/constants";
import { getLatestArticles } from "@/lib/articles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title:
      lang === "ja"
        ? { absolute: "HONMONOブログ | AIが深掘りするニッチな知識の宝庫" }
        : { absolute: "HONMONO Blog | AI-Powered Deep Dive into Niche Knowledge" },
    description:
      lang === "ja"
        ? "世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプ。AIが毎日1記事、ニッチな知識を深掘りしてお届け。"
        : "World food, Japanese culture, AI, health, sauna, coffee, camping. AI delivers one deep-dive article daily.",
    alternates: {
      canonical: `${SITE_URL}/ja`,
      languages: ENABLE_I18N
        ? { ja: `${SITE_URL}/ja`, en: `${SITE_URL}/en` }
        : { ja: `${SITE_URL}/ja` },
    },
  };
}

export default async function TopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const validLang = lang as Lang;
  const articles = await getLatestArticles(21);

  // Group articles by category
  const articlesByCategory: Record<string, typeof articles> = {};
  for (const article of articles) {
    if (!articlesByCategory[article.category]) {
      articlesByCategory[article.category] = [];
    }
    if (articlesByCategory[article.category].length < 3) {
      articlesByCategory[article.category].push(article);
    }
  }

  // JSON-LD: WebSite + SearchAction
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HONMONOブログ",
    url: SITE_URL,
    description:
      "AIが毎日深掘りするニッチな知識の宝庫。世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプ。",
    publisher: {
      "@type": "Organization",
      name: "HONMONO",
      url: SITE_URL,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${validLang}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
          HONMONO<span className="text-primary">ブログ</span>
        </h1>
        <p className="text-muted max-w-xl mx-auto leading-relaxed">
          AIが毎日深掘り。世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプ。
          <br />
          ニッチだけど確かな知識を、あなたに。
        </p>
      </section>

      {/* Category Sections */}
      {CATEGORIES.map((cat) => {
        const catArticles = articlesByCategory[cat.slug] || [];
        return (
          <section key={cat.slug} className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>{cat.emoji}</span>
                  <span>{validLang === "ja" ? cat.nameJa : cat.nameEn}</span>
                </h2>
                <p className="text-sm text-muted">{cat.catchcopy}</p>
              </div>
              <Link
                href={`/${validLang}/${cat.slug}`}
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                {validLang === "ja" ? "もっと見る →" : "View more →"}
              </Link>
            </div>
            {catArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    lang={validLang}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted bg-surface border border-border rounded-lg">
                <p className="text-sm">
                  {validLang === "ja"
                    ? "記事を準備中です。毎日更新されます。"
                    : "Articles coming soon. Updated daily."}
                </p>
              </div>
            )}
          </section>
        );
      })}

      <InternalLinks />
    </div>
    </>
  );
}
