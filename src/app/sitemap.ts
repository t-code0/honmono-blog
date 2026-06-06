import type { MetadataRoute } from "next";
import { CATEGORIES, ACTIVE_LANGS, SITE_URL } from "@/lib/constants";
import { getAllPublishedSlugs } from "@/lib/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = ACTIVE_LANGS.map((lang) => ({
    url: `${baseUrl}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = [];
  for (const lang of ACTIVE_LANGS) {
    for (const cat of CATEGORIES) {
      categoryPages.push({
        url: `${baseUrl}/${lang}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  // Article pages
  const slugs = await getAllPublishedSlugs();
  const articlePages: MetadataRoute.Sitemap = [];
  for (const { slug, category } of slugs) {
    for (const lang of ACTIVE_LANGS) {
      articlePages.push({
        url: `${baseUrl}/${lang}/${category}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return [...staticPages, ...categoryPages, ...articlePages];
}
