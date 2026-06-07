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
    title: "免責事項 | HONMONO ブログ",
    description:
      "HONMONOブログの免責事項。AI生成記事の特性、情報の正確性、外部リンクについての免責事項を掲載しています。",
    alternates: {
      canonical: `${SITE_URL}/${lang}/disclaimer`,
    },
  };
}

export default async function DisclaimerPage({ params }: Props) {
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
        <span>免責事項</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">免責事項</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-base leading-relaxed">
        <h2 className="text-xl font-bold mt-8 mb-3">
          1. AI生成コンテンツについて
        </h2>
        <p>
          当ブログの記事は、AI（人工知能）技術を活用して生成・編集されています。
          AIによる生成コンテンツには、事実と異なる情報が含まれる可能性があります。
          重要な判断を行う際は、必ず一次情報源や専門家にご確認ください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          2. 情報の正確性について
        </h2>
        <p>
          当ブログに掲載されている情報は、できる限り正確な情報を提供するよう努めておりますが、
          その正確性、完全性、有用性等について保証するものではありません。
          掲載情報に基づいて利用者が行った行動により生じた損害について、
          当ブログは一切の責任を負いかねます。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          3. 医療・健康情報について
        </h2>
        <p>
          当ブログに掲載されている健康・医療に関する情報は、一般的な情報提供を目的としており、
          医療行為の代替となるものではありません。
          具体的な症状や治療については、必ず医師や専門家にご相談ください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          4. 外部リンクについて
        </h2>
        <p>
          当ブログには外部サイトへのリンクが含まれています。
          リンク先の外部サイトの内容について、当ブログは一切の責任を負いません。
          外部サイトの利用に関しては、各サイトの利用規約・プライバシーポリシーをご確認ください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          5. 著作権について
        </h2>
        <p>
          当ブログに掲載されている文章・画像等のコンテンツの著作権は、
          当ブログ運営者に帰属します。
          無断での複製・転載・改変等はご遠慮ください。
          引用の際は、出典元の明記とリンクの設置をお願いいたします。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          6. 損害の免責
        </h2>
        <p>
          当ブログの利用により生じたいかなる損害（直接的・間接的を問わず）についても、
          当ブログ運営者は一切の責任を負いかねます。
          ご利用は利用者自身の責任において行ってください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          7. 免責事項の変更
        </h2>
        <p>
          当ブログは、必要に応じて本免責事項を変更することがあります。
          変更後の免責事項は、当ページに掲載した時点から効力を生じるものとします。
        </p>

        <p className="text-sm text-muted mt-8">制定日: 2026年6月7日</p>
      </div>
    </article>
  );
}
