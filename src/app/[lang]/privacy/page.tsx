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
    title: "プライバシーポリシー | HONMONO ブログ",
    description:
      "HONMONOブログのプライバシーポリシー。個人情報の取り扱い、Cookie利用、Google Analytics利用について説明します。",
    alternates: {
      canonical: `${SITE_URL}/${lang}/privacy`,
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
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
        <span>プライバシーポリシー</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-base leading-relaxed">
        <p>
          HONMONOブログ（以下「当ブログ」）は、ユーザーの個人情報の取り扱いについて、
          以下のとおりプライバシーポリシーを定めます。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">1. 個人情報の取得</h2>
        <p>
          当ブログでは、以下の場合に個人情報を取得することがあります。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>お問い合わせフォームからのご連絡時（メールアドレス、お名前）</li>
          <li>アクセス解析ツールによる自動取得（IPアドレス、ブラウザ情報、閲覧ページ等）</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">2. 個人情報の利用目的</h2>
        <p>取得した個人情報は、以下の目的で利用します。</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>お問い合わせへの回答</li>
          <li>当ブログの改善・運営に関する分析</li>
          <li>サービスの品質向上</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">3. 個人情報の第三者提供</h2>
        <p>
          当ブログは、法令に基づく場合を除き、取得した個人情報を本人の同意なく
          第三者に提供することはありません。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          4. アクセス解析ツールについて
        </h2>
        <p>
          当ブログでは、Googleによるアクセス解析ツール「Google
          Analytics」を利用する場合があります。Google
          Analyticsはトラフィックデータの収集のためにCookieを使用しています。
          このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
        </p>
        <p>
          この機能はCookieを無効にすることで収集を拒否できますので、
          お使いのブラウザの設定をご確認ください。Google
          Analyticsの利用規約については、
          Google Analyticsのサイトをご確認ください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">5. Cookieについて</h2>
        <p>
          当ブログでは、ユーザーの利便性向上のためにCookieを使用する場合があります。
          Cookieはブラウザの設定により拒否することが可能ですが、
          一部の機能が利用できなくなる場合があります。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          6. 広告配信サービスについて
        </h2>
        <p>
          当ブログでは、第三者配信の広告サービス（Google
          AdSense等）を利用する場合があります。
          広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
        </p>
        <p>
          当サイトはAmazonアソシエイト・プログラムに参加しており、適格販売により紹介料を得ています。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          7. 個人情報の開示・訂正・削除
        </h2>
        <p>
          ご本人から個人情報の開示・訂正・削除のご請求があった場合、
          本人確認の上、速やかに対応いたします。
          下記のお問い合わせ先までご連絡ください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          8. プライバシーポリシーの変更
        </h2>
        <p>
          当ブログは、必要に応じて本ポリシーを変更することがあります。
          変更後のポリシーは、当ページに掲載した時点から効力を生じるものとします。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">9. お問い合わせ</h2>
        <p>
          プライバシーポリシーに関するお問い合わせは、下記までご連絡ください。
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
