import type { MetadataRoute } from "next";
import { CATEGORIES, ACTIVE_LANGS, SITE_URL } from "@/lib/constants";
import { getSupabase } from "@/lib/supabase";

function alternate(path: string) {
  return {
    languages: Object.fromEntries(
      ACTIVE_LANGS.map(lang => [lang, `${SITE_URL}/${lang}${path}`])
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = ACTIVE_LANGS.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1.0,
    alternates: alternate(""),
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = [];
  for (const cat of CATEGORIES) {
    for (const lang of ACTIVE_LANGS) {
      categoryPages.push({
        url: `${baseUrl}/${lang}/${cat.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: alternate(`/${cat.slug}`),
      });
    }
  }

  // Article pages with updated_at
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("blog_articles")
        .select("slug, category, updated_at")
        .eq("status", "published");
      if (data) {
        for (const article of data as { slug: string; category: string; updated_at?: string }[]) {
          for (const lang of ACTIVE_LANGS) {
            articlePages.push({
              url: `${baseUrl}/${lang}/${article.category}/${article.slug}`,
              lastModified: article.updated_at || now,
              changeFrequency: "monthly",
              priority: 0.7,
              alternates: alternate(`/${article.category}/${article.slug}`),
            });
          }
        }
      }
    }
  } catch {}

  return [...staticPages, ...categoryPages, ...articlePages];
}
