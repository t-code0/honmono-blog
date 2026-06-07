import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            // TODO: Replace 'unsafe-inline' / 'unsafe-eval' with nonce-based CSP
            // once all inline scripts (GA, AdSense) are migrated to nonce pattern.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' www.googletagmanager.com www.google-analytics.com pagead2.googlesyndication.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: www.google-analytics.com pagead2.googlesyndication.com px.a8.net af.moshimo.com",
              "font-src 'self'",
              "connect-src 'self' *.supabase.co www.google-analytics.com www.googletagmanager.com pagead2.googlesyndication.com",
              "frame-src pagead2.googlesyndication.com googleads.g.doubleclick.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
