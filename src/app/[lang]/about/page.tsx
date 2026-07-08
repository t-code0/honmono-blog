import { Metadata } from "next";
import { SITE_URL, SUPPORTED_LANGS, type Lang } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: "運営者情報 | HONMONO ブログ",
    description:
      "HONMONOブログの運営者情報。AIが深掘りするニッチな知識の宝庫。7カテゴリで知的好奇心を刺激します。",
    alternates: {
      canonical: `${SITE_URL}/${lang}/about`,
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as Lang)) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link href={`/${lang}`} className="hover:text-foreground">
          ホーム
        </Link>
        <span className="mx-2">/</span>
        <span>運営者情報</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">運営者情報</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-base leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 font-medium w-1/3">
                サイト名
              </th>
              <td className="py-3">HONMONO ブログ</td>
            </tr>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 font-medium">運営形態</th>
              <td className="py-3">個人運営</td>
            </tr>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 font-medium">連絡先</th>
              <td className="py-3">
                <a
                  href="mailto:honmono.blog@gmail.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  honmono.blog@gmail.com
                </a>
              </td>
            </tr>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 font-medium">開設日</th>
              <td className="py-3">2026年6月</td>
            </tr>
            <tr className="border-b border-border">
              <th className="text-left py-3 pr-4 font-medium">URL</th>
              <td className="py-3">
                <a
                  href="https://honmono-blog.vercel.app"
                  className="text-blue-600 hover:text-blue-800"
                >
                  https://honmono-blog.vercel.app
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-xl font-bold mt-8 mb-3">当ブログについて</h2>
        <p>
          HONMONO ブログは「AIが毎日深掘りするニッチな知識の宝庫」をコンセプトに、
          7つのカテゴリ（世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプ）で
          ロングテールの知識を発信するブログメディアです。
        </p>
        <p>
          記事はAI技術を活用して生成・編集しており、
          正確性と品質の維持に努めています。
          記事内容に関するご指摘・ご意見がございましたら、
          上記連絡先までお気軽にお問い合わせください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">HONMONO シリーズ</h2>
        <p>
          HONMONOブログは、以下のHONMONOシリーズの一部として運営しています。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <a
              href="https://tenkabutsu-zukan.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              添加物図鑑
            </a>{" "}
            - 食品添加物の危険度をAIが分析
          </li>
          <li>
            <a
              href="https://eiyo-zukan.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              栄養図鑑
            </a>{" "}
            - 栄養成分をPubMed論文付きで解説
          </li>
          <li>
            <a
              href="https://musarebito.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              蒸され人
            </a>{" "}
            - サウナ施設のととのい度スコア
          </li>
          <li>
            <a
              href="https://ritama.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              リタマ
            </a>{" "}
            - 口コミAI分析で本物のお店を発見
          </li>
        </ul>

        <p className="text-sm text-muted mt-8">最終更新: 2026年6月7日</p>
      </div>
    </article>
  );
}
