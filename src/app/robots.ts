import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"]
      },
      // 네이버 봇 명시적 허용
      { userAgent: "Yeti", allow: "/", disallow: ["/api/"] },
      // 다음 봇
      { userAgent: "Daum", allow: "/", disallow: ["/api/"] },
      // 구글 봇
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/"] }
    ],
    sitemap: "https://heartismnews.co.kr/sitemap.xml",
    host: "https://heartismnews.co.kr"
  };
}
