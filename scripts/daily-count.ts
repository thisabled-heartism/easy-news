import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";
import { kstDayString } from "../src/lib/date-utils";

async function main() {
  const articles = await prisma.article.findMany({
    where: { status: "ready" },
    select: { publishedAt: true }
  });

  const byDay: Record<string, number> = {};
  for (const a of articles) {
    const day = kstDayString(a.publishedAt);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  console.log("=== 날짜별 변환된 기사 수 ===");
  Object.keys(byDay).sort((a, b) => b.localeCompare(a)).slice(0, 14).forEach(day => {
    console.log(`  ${day}: ${byDay[day]}건`);
  });

  console.log(`\n총 ${articles.length}건`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
