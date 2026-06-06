import Link from "next/link";
import { type Article } from "@/lib/articles";
import { getCategoryBySlug, type Lang } from "@/lib/constants";

export function ArticleCard({
  article,
  lang,
}: {
  article: Article;
  lang: Lang;
}) {
  const category = getCategoryBySlug(article.category);

  return (
    <article className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-surface">
      <Link href={`/${lang}/${article.category}/${article.slug}`}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {category?.emoji} {category?.nameJa || article.category}
            </span>
            {article.published_at && (
              <time className="text-xs text-muted">
                {new Date(article.published_at).toLocaleDateString("ja-JP")}
              </time>
            )}
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        </div>
      </Link>
    </article>
  );
}
