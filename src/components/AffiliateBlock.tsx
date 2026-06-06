interface AffiliateBlockProps {
  blocks: Record<string, unknown> | null;
}

export function AffiliateBlock({ blocks }: AffiliateBlockProps) {
  // JSONB構造で後から設定可能。現時点ではnull許容。
  if (!blocks || Object.keys(blocks).length === 0) return null;

  // 将来的な構造例:
  // { "amazon": { "title": "...", "url": "...", "image": "..." } }
  return (
    <aside className="my-8 p-4 border border-amber-200 rounded-lg bg-amber-50">
      <p className="text-xs text-muted mb-2 font-medium">PR</p>
      {Object.entries(blocks).map(([key, value]) => {
        const item = value as { title?: string; url?: string; description?: string };
        if (!item?.url) return null;
        return (
          <a
            key={key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block hover:underline"
          >
            <p className="font-bold text-sm">{item.title || "おすすめ"}</p>
            {item.description && (
              <p className="text-xs text-muted mt-1">{item.description}</p>
            )}
          </a>
        );
      })}
    </aside>
  );
}
