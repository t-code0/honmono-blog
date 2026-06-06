import Link from "next/link";
import { CATEGORIES, type Lang } from "@/lib/constants";

export function Header({ lang }: { lang: Lang }) {
  return (
    <header className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground tracking-tight">
            HONMONO
          </span>
          <span className="text-sm text-muted">ブログ</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${lang}/${cat.slug}`}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              {cat.emoji} {cat.nameJa}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`/ja`}
            className={`text-xs px-2 py-1 rounded ${lang === "ja" ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}
          >
            JP
          </Link>
          <Link
            href={`/en`}
            className={`text-xs px-2 py-1 rounded ${lang === "en" ? "bg-primary text-white" : "text-muted hover:text-foreground"}`}
          >
            EN
          </Link>
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden overflow-x-auto border-t border-border">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${lang}/${cat.slug}`}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-muted hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
            >
              {cat.emoji} {cat.nameJa}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
