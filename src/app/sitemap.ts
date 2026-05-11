import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = "https://heartismnews.co.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: { status: "ready" },
    select: { id: true, simplifiedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" }
  });

  const articleEntries: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${BASE_URL}/news/${a.id}`,
    lastModified: a.simplifiedAt ?? a.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  const categories = ["발달장애", "사회", "정치", "경제", "문화", "날씨"];
  const categoryEntries: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE_URL}/?category=${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    ...categoryEntries,
    ...articleEntries
  ];
}
