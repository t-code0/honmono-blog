interface AffiliateItem {
  program_id: number;
  title: string;
  url: string;
  description: string;
}

interface AffiliateBlockProps {
  blocks: AffiliateItem[] | Record<string, unknown> | null;
  articleId?: number;
}

export function AffiliateBlock({ blocks, articleId }: AffiliateBlockProps) {
  if (!blocks) return null;

  // 新形式: AffiliateItem[]
  const items: AffiliateItem[] = Array.isArray(blocks)
    ? blocks
    : // 旧形式: Record<string, {title, url, description}> との互換
      Object.entries(blocks)
        .filter(([, v]) => v && typeof v === "object" && "url" in (v as Record<string, unknown>))
        .map(([key, v]) => {
          const item = v as { title?: string; url?: string; description?: string };
          return {
            program_id: 0,
            title: item.title || key,
            url: item.url || "",
            description: item.description || "",
          };
        });

  if (items.length === 0) return null;

  const trackingParams = articleId ? `?ref=blog&aid=${articleId}` : "";

  return (
    <aside className="my-8 p-5 border border-amber-200 rounded-lg bg-amber-50/50">
      <p className="text-xs text-muted mb-3 font-medium uppercase tracking-wider">
        おすすめ商品・サービス
      </p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <a
            key={i}
            href={`${item.url}${trackingParams}&pid=${item.program_id}`}
            target="_blank"
            rel="nofollow noopener noreferrer sponsored"
            className="flex items-start gap-3 p-3 bg-white border border-amber-100 rounded-md hover:shadow-sm transition-shadow group"
            data-program-id={item.program_id}
            data-article-id={articleId}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">🛒</span>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {item.description}
                </p>
              )}
              <span className="text-xs text-primary mt-1 inline-block">
                詳しく見る →
              </span>
            </div>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted mt-2">
        ※ 上記はアフィリエイトリンクを含みます
      </p>
    </aside>
  );
}
