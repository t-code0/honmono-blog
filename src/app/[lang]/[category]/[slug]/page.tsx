import { type Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CATEGORY_SLUGS,
  ENABLE_I18N,
  getCategoryBySlug,
  SITE_URL,
  type Lang,
} from "@/lib/constants";
import { getArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { markdownToHtml } from "@/lib/markdown";
import { RelatedArticles } from "@/components/RelatedArticles";
import { InternalLinks } from "@/components/InternalLinks";
import { AffiliateBlock } from "@/components/AffiliateBlock";

export const revalidate = 3600; // ISR: 1 hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, category, slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const cat = getCategoryBySlug(category);
  const title = article.title;
  const description = article.description;
  const url = `${SITE_URL}/${lang}/${category}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/ja/${category}/${slug}`,
      languages: ENABLE_I18N
        ? { ja: `${SITE_URL}/ja/${category}/${slug}`, en: `${SITE_URL}/en/${category}/${slug}` }
        : { ja: `${SITE_URL}/ja/${category}/${slug}` },
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.published_at,
      section: cat?.nameJa,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; category: string; slug: string }>;
}) {
  const { lang, category, slug } = await params;
  const validLang = lang as Lang;

  if (!CATEGORY_SLUGS.includes(category)) {
    notFound();
  }

  const article = await getArticleBySlug(slug);
  if (!article || article.category !== category) {
    notFound();
  }

  const cat = getCategoryBySlug(category)!;
  const relatedArticles = await getRelatedArticles(category, slug, 3);
  const contentHtml = markdownToHtml(article.content_md);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      "@type": "Organization",
      name: "HONMONO",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "HONMONO",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${lang}/${category}/${slug}`,
    },
    articleSection: cat.nameJa,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6">
          <Link href={`/${validLang}`} className="hover:text-foreground">
            {validLang === "ja" ? "トップ" : "Home"}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/${validLang}/${category}`}
            className="hover:text-foreground"
          >
            {cat.emoji} {validLang === "ja" ? cat.nameJa : cat.nameEn}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{article.title}</span>
        </nav>

        {/* Category badge + date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {cat.emoji} {cat.nameJa}
          </span>
          {article.published_at && (
            <time className="text-sm text-muted">
              {new Date(article.published_at).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </div>

        {/* TOC */}
        {article.toc && article.toc.length > 0 && (
          <nav className="mb-8 p-4 bg-gray-50 border border-border rounded-lg">
            <h2 className="text-sm font-bold mb-2 text-muted">
              {validLang === "ja" ? "目次" : "Table of Contents"}
            </h2>
            <ul className="space-y-1">
              {article.toc.map((item, i) => (
                <li
                  key={i}
                  style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Article content */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Affiliate block */}
        <AffiliateBlock blocks={article.affiliate_blocks} />

        {/* Related articles */}
        <RelatedArticles articles={relatedArticles} lang={validLang} />

        {/* Internal links to HONMONO apps */}
        <InternalLinks />
      </article>
    </>
  );
}
