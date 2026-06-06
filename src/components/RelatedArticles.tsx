import { ArticleCard } from "./ArticleCard";
import { type Article } from "@/lib/articles";
import { type Lang } from "@/lib/constants";

export function RelatedArticles({
  articles,
  lang,
}: {
  articles: Article[];
  lang: Lang;
}) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-lg font-bold mb-4">関連記事</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} lang={lang} />
        ))}
      </div>
    </section>
  );
}
