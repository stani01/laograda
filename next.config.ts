import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents this site from being framed by other origins (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from MIME-sniffing a response away from its declared Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin (not full URL/query) to other sites on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // We don't use any of these browser features — deny them by default.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Force HTTPS for a year, including subdomains (Vercel already serves over HTTPS only).
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
