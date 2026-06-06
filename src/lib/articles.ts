import { getSupabase } from "./supabase";

export interface Article {
  id: number;
  slug: string;
  keyword_id: number;
  category: string;
  title: string;
  description: string;
  content_md: string;
  toc: { level: number; text: string; id: string }[];
  affiliate_blocks: Record<string, unknown> | null;
  thumbnail_url: string | null;
  status: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export async function getArticlesByCategory(
  category: string,
  limit = 20
): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("category", category)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch articles by category:", error.message);
    return [];
  }
  return (data as Article[]) || [];
}

export async function getLatestArticles(limit = 20): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch latest articles:", error.message);
    return [];
  }
  return (data as Article[]) || [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Failed to fetch article:", error.message);
    return null;
  }
  return data as Article;
}

export async function getRelatedArticles(
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("category", category)
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch related articles:", error.message);
    return [];
  }
  return (data as Article[]) || [];
}

export async function getAllPublishedSlugs(): Promise<
  { slug: string; category: string }[]
> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_articles")
    .select("slug, category")
    .eq("status", "published");

  if (error) {
    console.error("Failed to fetch slugs:", error.message);
    return [];
  }
  return (data as { slug: string; category: string }[]) || [];
}
