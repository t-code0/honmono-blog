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
    title: "アフィリエイト表示 | HONMONO ブログ",
    description:
      "HONMONOブログのアフィリエイトプログラムへの参加と広告掲載に関する表示です。",
    alternates: {
      canonical: `${SITE_URL}/${lang}/affiliate-disclosure`,
    },
  };
}

export default async function AffiliateDisclosurePage({ params }: Props) {
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
        <span>アフィリエイト表示</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">
        広告・アフィリエイトに関する表示
      </h1>

      <div className="prose prose-gray max-w-none space-y-6 text-base leading-relaxed">
        <h2 className="text-xl font-bold mt-8 mb-3">
          1. アフィリエイトプログラムへの参加
        </h2>
        <p>
          当ブログは、以下のアフィリエイトプログラムに参加しています。
          記事内に掲載されるリンクの一部はアフィリエイトリンクであり、
          リンク先で商品・サービスをご購入いただいた場合、
          当ブログ運営者に紹介報酬が支払われることがあります。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          2. 参加しているアフィリエイトサービス
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>A8.net</strong> -
            株式会社ファンコミュニケーションズが運営する日本最大級のアフィリエイトサービスプロバイダー
          </li>
          <li>
            <strong>もしもアフィリエイト</strong> -
            株式会社もしもが運営するアフィリエイトサービス
          </li>
          <li>
            <strong>Amazonアソシエイト</strong> -
            Amazon.co.jpを宣伝しリンクすることによって紹介料を獲得できるプログラム
          </li>
          <li>
            <strong>楽天アフィリエイト</strong> -
            楽天グループ株式会社が提供するアフィリエイトプログラム
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          3. 広告表示について
        </h2>
        <p>
          アフィリエイトリンクを含む記事・セクションには、
          「広告」または「PR」の表示を行っています。
          当ブログでは2023年10月施行のステルスマーケティング規制（景品表示法）を遵守し、
          広告であることを明確に表示しています。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          4. 記事の中立性について
        </h2>
        <p>
          アフィリエイトプログラムへの参加が、記事内容の公正性・中立性に影響を与えることはありません。
          当ブログでは、読者の皆様にとって有益な情報を提供することを最優先としています。
          商品・サービスの紹介は、実際の品質・特徴に基づいて行っています。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          5. リンクの見分け方
        </h2>
        <p>
          アフィリエイトリンクには以下の特徴があります。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            リンクに <code>rel=&quot;nofollow noopener noreferrer sponsored&quot;</code>{" "}
            属性が付与されています
          </li>
          <li>記事内の広告セクションには「広告」と明記しています</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          6. 報酬の使途
        </h2>
        <p>
          アフィリエイト報酬は、当ブログの運営費用（サーバー費用、ドメイン費用、
          コンテンツ品質の向上等）に充てさせていただいています。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          7. Amazonアソシエイトについて
        </h2>
        <p>
          Amazonのアソシエイトとして、当メディアは適格販売により収入を得ています。
          当サイトでは、Amazon.co.jpの商品リンクをアフィリエイトリンクとして掲載しています。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">8. お問い合わせ</h2>
        <p>
          アフィリエイト表示に関するご質問は、下記までご連絡ください。
        </p>
        <p className="font-medium">
          メール:{" "}
          <a
            href="mailto:honmono.blog@gmail.com"
            className="text-blue-600 hover:text-blue-800"
          >
            honmono.blog@gmail.com
          </a>
        </p>

        <p className="text-sm text-muted mt-8">制定日: 2026年6月7日</p>
      </div>
    </article>
  );
}
