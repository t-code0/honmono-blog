import { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | HONMONO GOODS",
  description:
    "Privacy Policy for HONMONO GOODS. Learn how we handle personal information in our Print-on-Demand services, Pinterest API usage, and cookie practices.",
  alternates: {
    canonical: `${SITE_URL}/honmono-goods-privacy`,
  },
};

export default function HonmonoGoodsPrivacyRootPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link href="/ja" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>HONMONO GOODS</span>
        <span className="mx-2">/</span>
        <span>Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

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
    </article>
  );
}
