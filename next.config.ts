import type { NextConfig } from "next";

const securityHeaders = [
  // 클릭재킹 방지
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // MIME 타입 스니핑 방지
  { key: "X-Content-Type-Options", value: "nosniff" },
  // XSS 필터 활성화 (구형 브라우저용)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // 리퍼러 정보 최소화
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HTTPS 강제 (1년)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // 권한 정책 (카메라/마이크 등 불필요한 권한 차단)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
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
