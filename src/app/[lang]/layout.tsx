import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SUPPORTED_LANGS, SITE_URL, type Lang } from "@/lib/constants";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as Lang)) {
    notFound();
  }
  const validLang = lang as Lang;
  const altLang = validLang === "ja" ? "en" : "ja";

  return (
    <>
      <head>
        <link
          rel="alternate"
          hrefLang={validLang}
          href={`${SITE_URL}/${validLang}`}
        />
        <link
          rel="alternate"
          hrefLang={altLang}
          href={`${SITE_URL}/${altLang}`}
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${SITE_URL}/ja`}
        />
      </head>
      <Header lang={validLang} />
      <main className="flex-1">{children}</main>
      <Footer lang={validLang} />
    </>
  );
}
