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
  const isJa = lang === "ja";

  return {
    title: isJa
      ? "プライバシーポリシー | HONMONO GOODS"
      : "Privacy Policy | HONMONO GOODS",
    description: isJa
      ? "HONMONO GOODSのプライバシーポリシー。Print-on-Demandサービスにおける個人情報の取り扱い、Pinterest API利用、Cookie利用について説明します。"
      : "Privacy Policy for HONMONO GOODS. Learn how we handle personal information in our Print-on-Demand services, Pinterest API usage, and cookie practices.",
    alternates: {
      canonical: `${SITE_URL}/${lang}/honmono-goods/privacy`,
      languages: {
        ja: `${SITE_URL}/ja/honmono-goods/privacy`,
        en: `${SITE_URL}/en/honmono-goods/privacy`,
        "x-default": `${SITE_URL}/ja/honmono-goods/privacy`,
      },
    },
  };
}

function JaContent() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        プライバシーポリシー
      </h1>

      <div className="prose prose-gray max-w-none space-y-6 text-base leading-relaxed">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 mb-8">
          <p className="font-bold text-lg mb-2">運営者情報</p>
          <ul className="list-none pl-0 space-y-1 text-sm">
            <li>事業者名: HONMONO GOODS</li>
            <li>ブランド: HETAGAWA（ヘタ川画伯）</li>
            <li>
              連絡先:{" "}
              <a
                href="mailto:honmono.blog@gmail.com"
                className="text-blue-600 hover:text-blue-800"
              >
                honmono.blog@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <p>
          HONMONO GOODS（以下「当社」）は、ユーザーのプライバシーを尊重し、
          個人情報の保護に努めます。本ポリシーでは、当社のサービスにおける
          個人情報の取り扱いについて説明します。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">1. 事業内容</h2>
        <p>
          当社はPrint-on-Demand（POD）ビジネスを運営しており、
          オリジナルデザインの商品を以下のプラットフォームで販売しています。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <a
              href="https://suzuri.jp/honmonogoods"
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              SUZURI
            </a>
            （suzuri.jp/honmonogoods）
          </li>
          <li>
            <a
              href="https://www.redbubble.com/people/honmonogoods"
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Redbubble
            </a>
            （honmonogoods）
          </li>
          <li>
            <a
              href="https://www.teepublic.com/user/honmonogoodsstudio"
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              TeePublic
            </a>
            （HONMONOGOODSSTUDIO）
          </li>
        </ul>
        <p>
          商品の販売・決済・発送・返品対応は、各外部プラットフォームが処理します。
          当社はこれらの取引に関する個人情報を直接取得・保管しません。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">2. 収集する情報</h2>
        <p>
          当サイト（honmono-blog.vercel.app）自体では、ユーザーの個人情報を
          直接収集することはありません。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>会員登録やログイン機能はありません</li>
          <li>お問い合わせはメールで受け付けており、フォーム入力による情報収集は行いません</li>
          <li>
            Pinterest APIを使用した自動投稿では、投稿主（当社）のアカウント情報のみを使用し、
            ユーザーの情報は一切収集しません
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">3. Cookieの使用</h2>
        <p>
          当サイトでは、アクセス解析のためにCookieを使用する場合があります。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Google Analyticsを利用してトラフィックデータを匿名で収集することがあります。
            これは個人を特定するものではありません。
          </li>
          <li>
            Cookieはブラウザの設定により拒否することが可能です。
            ただし、一部の機能が利用できなくなる場合があります。
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">4. Pinterest API利用について</h2>
        <p>
          当社はPinterest APIを以下の目的で使用しています。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>目的: 自社商品Pinの自動投稿</li>
          <li>使用スコープ: pins:read, pins:write, boards:read, boards:write</li>
          <li>ユーザーデータの収集: なし（当社アカウントの情報のみ使用）</li>
        </ul>
        <p>
          Pinterest APIを通じて第三者のユーザーデータにアクセスすることはありません。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">5. 第三者への情報提供</h2>
        <p>
          当社は、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
          商品の販売に関する情報は、販売プラットフォーム（SUZURI / Redbubble / TeePublic）の
          各プライバシーポリシーに基づいて処理されます。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">6. ユーザーの権利</h2>
        <p>
          GDPR（EU一般データ保護規則）およびCCPA（カリフォルニア州消費者プライバシー法）に
          基づき、ユーザーには以下の権利があります。
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>アクセス権: 当社が保持するご自身の個人情報へのアクセスを請求する権利</li>
          <li>訂正権: 不正確な個人情報の訂正を求める権利</li>
          <li>削除権: 個人情報の削除を求める権利</li>
          <li>データポータビリティ: 個人情報を構造化された形式で受け取る権利</li>
          <li>異議申立権: 個人情報の処理に対して異議を申し立てる権利</li>
        </ul>
        <p>
          これらの権利を行使される場合は、下記のお問い合わせ先までご連絡ください。
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">7. お問い合わせ</h2>
        <p>
          本プライバシーポリシーに関するお問い合わせは、下記までご連絡ください。
        </p>
        <p className="font-medium">
          HONMONO GOODS{" "}
          <a
            href="mailto:honmono.blog@gmail.com"
            className="text-blue-600 hover:text-blue-800"
          >
            honmono.blog@gmail.com
          </a>
        </p>

        <p className="text-sm text-muted mt-8">最終更新: 2026年7月8日</p>
      </div>
    </>
  );
}

function EnContent() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-gray max-w-none space-y-6 text-base leading-relaxed">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 mb-8">
          <p className="font-bold text-lg mb-2">Business Information</p>
          <ul className="list-none pl-0 space-y-1 text-sm">
            <li>Business Name: HONMONO GOODS</li>
            <li>Brand: HETAGAWA</li>
            <li>
              Contact:{" "}
              <a
                href="mailto:honmono.blog@gmail.com"
                className="text-blue-600 hover:text-blue-800"
              >
                honmono.blog@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <p>
          HONMONO GOODS (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is
          committed to protecting your personal information. This policy explains
          how we handle personal information in connection with our services.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">1. Our Business</h2>
        <p>
          We operate a Print-on-Demand (POD) business, selling original design
          merchandise through the following platforms:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <a
              href="https://suzuri.jp/honmonogoods"
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              SUZURI
            </a>
            {" "}(suzuri.jp/honmonogoods)
          </li>
          <li>
            <a
              href="https://www.redbubble.com/people/honmonogoods"
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Redbubble
            </a>
            {" "}(honmonogoods)
          </li>
          <li>
            <a
              href="https://www.teepublic.com/user/honmonogoodsstudio"
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              TeePublic
            </a>
            {" "}(HONMONOGOODSSTUDIO)
          </li>
        </ul>
        <p>
          All sales, payments, shipping, and returns are processed by the
          respective external platforms. We do not directly collect or store
          personal information from these transactions.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">2. Information We Collect</h2>
        <p>
          This website (honmono-blog.vercel.app) does not directly collect
          personal information from users.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>There is no user registration or login functionality</li>
          <li>Inquiries are handled via email; we do not collect information through forms</li>
          <li>
            Our use of Pinterest API for automated posting only utilizes our own
            account information and does not collect any user data
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">3. Cookies</h2>
        <p>
          This website may use cookies for analytics purposes.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            We may use Google Analytics to anonymously collect traffic data.
            This data does not personally identify you.
          </li>
          <li>
            You can refuse cookies through your browser settings, though some
            features may become unavailable.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">4. Pinterest API Usage</h2>
        <p>
          We use the Pinterest API for the following purposes:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Purpose: Automated posting of our product Pins</li>
          <li>Scopes used: pins:read, pins:write, boards:read, boards:write</li>
          <li>User data collection: None (only our own account information is used)</li>
        </ul>
        <p>
          We do not access any third-party user data through the Pinterest API.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">5. Third-Party Disclosure</h2>
        <p>
          We do not share your personal information with third parties except as
          required by law. Information related to product sales is processed
          under the privacy policies of the respective sales platforms
          (SUZURI / Redbubble / TeePublic).
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">6. Your Rights</h2>
        <p>
          Under the GDPR (General Data Protection Regulation) and CCPA
          (California Consumer Privacy Act), you have the following rights:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Right of Access: Request access to your personal information we hold</li>
          <li>Right to Rectification: Request correction of inaccurate personal information</li>
          <li>Right to Erasure: Request deletion of your personal information</li>
          <li>Right to Data Portability: Receive your personal information in a structured format</li>
          <li>Right to Object: Object to the processing of your personal information</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at the email address below.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">7. Contact Us</h2>
        <p>
          For inquiries regarding this Privacy Policy, please contact us at:
        </p>
        <p className="font-medium">
          HONMONO GOODS{" "}
          <a
            href="mailto:honmono.blog@gmail.com"
            className="text-blue-600 hover:text-blue-800"
          >
            honmono.blog@gmail.com
          </a>
        </p>

        <p className="text-sm text-muted mt-8">Last updated: July 8, 2026</p>
      </div>
    </>
  );
}

export default async function HonmonoGoodsPrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as Lang)) {
    notFound();
  }

  const isJa = lang === "ja";

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link href={`/${lang}`} className="hover:text-foreground">
          {isJa ? "ホーム" : "Home"}
        </Link>
        <span className="mx-2">/</span>
        <span>HONMONO GOODS</span>
        <span className="mx-2">/</span>
        <span>{isJa ? "プライバシーポリシー" : "Privacy Policy"}</span>
      </nav>

      {isJa ? <JaContent /> : <EnContent />}
    </article>
  );
}
