import Parser from "rss-parser";
import { prisma } from "./db";
import { NEWS_SOURCES, type NewsSource } from "./sources";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "EasyNewsBot/0.1 (+https://easy-news.local)" }
});

function stripHtml(input: string | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function crawlSource(source: NewsSource) {
  const feed = await parser.parseURL(source.rss);
  let inserted = 0;

  for (const item of feed.items) {
    if (!item.link || !item.title) continue;

    const body = stripHtml(item.contentSnippet || item.content || item.summary || "");
    if (!body) continue;

    const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();

    const cleanTitle = stripHtml(item.title);

    try {
      await prisma.article.create({
        data: {
          source: source.name,
          sourceUrl: item.link,
          originalTitle: cleanTitle,
          originalBody: body,
          category: source.category,
          publishedAt,
          status: "pending"
        }
      });
      inserted++;
    } catch (e: unknown) {
      // unique constraint = already crawled, skip
      if (!(e instanceof Error && e.message.includes("Unique"))) {
        console.error(`[crawler] insert fail: ${item.link}`, e);
      }
    }
  }

  return { source: source.name, fetched: feed.items.length, inserted };
}

export async function crawlAll() {
  const results = [];
  for (const src of NEWS_SOURCES) {
    try {
      results.push(await crawlSource(src));
    } catch (e) {
      console.error(`[crawler] source fail: ${src.name}`, e);
      results.push({ source: src.name, fetched: 0, inserted: 0, error: String(e) });
    }
  }
  return results;
}
