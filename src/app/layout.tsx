import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HONMONOブログ | AIが深掘りするニッチな知識の宝庫",
    template: "%s | HONMONOブログ",
  },
  description:
    "世界の食・日本文化・AI・健康・サウナ・珈琲・キャンプ。AIが毎日1記事、ニッチな知識を深掘りしてお届け。",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: "HONMONOブログ",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
