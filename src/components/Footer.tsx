import Link from "next/link";
import { CATEGORIES, HONMONO_APPS, type Lang } from "@/lib/constants";

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-border bg-gray-50 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2">HONMONO ブログ</h3>
            <p className="text-sm text-muted leading-relaxed">
              AIが深掘りするニッチな知識の宝庫。
              世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプ。
              毎日1記事、知的好奇心を刺激します。
            </p>
          </div>
          {/* Categories */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-muted uppercase tracking-wider">
              カテゴリ
            </h3>
            <ul className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${lang}/${cat.slug}`}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {cat.emoji} {cat.nameJa}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* HONMONO Apps */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-muted uppercase tracking-wider">
              HONMONOシリーズ
            </h3>
            <ul className="space-y-1.5">
              {HONMONO_APPS.map((app) => (
                <li key={app.name}>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {app.emoji} {app.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} HONMONO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
