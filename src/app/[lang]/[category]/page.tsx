import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { InternalLinks } from "@/components/InternalLinks";
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  getCategoryBySlug,
  SITE_URL,
  SUPPORTED_LANGS,
  type Lang,
} from "@/lib/constants";
import { getArticlesByCategory } from "@/lib/articles";
import Link from "next/link";

export function generateStaticParams() {
  const params: { lang: string; category: string }[] = [];
  for (const lang of SUPPORTED_LANGS) {
    for (const slug of CATEGORY_SLUGS) {
      params.push({ lang, category: slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}): Promise<Metadata> {
  const { lang, category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};

  const title =
    lang === "ja"
      ? `${cat.nameJa} | HONMONOブログ`
      : `${cat.nameEn} | HONMONO Blog`;
  const description =
    lang === "ja"
      ? `${cat.catchcopy}。${cat.nameJa}に関する深掘り記事をお届けします。`
      : `Deep dive articles about ${cat.nameEn}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/${category}`,
      languages: {
        ja: `${SITE_URL}/ja/${category}`,
        en: `${SITE_URL}/en/${category}`,
      },
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  const validLang = lang as Lang;

  if (!CATEGORY_SLUGS.includes(category)) {
    notFound();
  }

  const cat = getCategoryBySlug(category)!;
  const articles = await getArticlesByCategory(category);

  // Other categories for sidebar
  const otherCategories = CATEGORIES.filter((c) => c.slug !== category);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6">
        <Link href={`/${validLang}`} className="hover:text-foreground">
          {validLang === "ja" ? "トップ" : "Home"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">
          {cat.emoji} {validLang === "ja" ? cat.nameJa : cat.nameEn}
        </span>
      </nav>

      {/* Category Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
          {cat.emoji} {validLang === "ja" ? cat.nameJa : cat.nameEn}
        </h1>
        <p className="text-muted">{cat.catchcopy}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main */}
        <div className="lg:col-span-3">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  lang={validLang}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted bg-surface border border-border rounded-lg">
              <p className="text-lg mb-2">
                {validLang === "ja"
                  ? "記事を準備中です"
                  : "Articles coming soon"}
              </p>
              <p className="text-sm">
                {validLang === "ja"
                  ? "毎日1記事ずつ追加されます。お楽しみに。"
                  : "One article added daily. Stay tuned."}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <h3 className="font-bold text-sm mb-3 text-muted uppercase tracking-wider">
              {validLang === "ja" ? "他のカテゴリ" : "Other Categories"}
            </h3>
            <ul className="space-y-2">
              {otherCategories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${validLang}/${c.slug}`}
                    className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                  >
                    <span>{c.emoji}</span>
                    <span>{validLang === "ja" ? c.nameJa : c.nameEn}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <InternalLinks />
    </div>
  );
}
