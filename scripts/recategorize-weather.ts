import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";
import { isWeatherArticle } from "../src/lib/weather-detect";

async function main() {
  const all = await prisma.article.findMany({
    where: { NOT: { category: "날씨" } }
  });

  console.log(`전체 검사 대상: ${all.length}건`);
  let updated = 0;

  for (const a of all) {
    if (isWeatherArticle(a.originalTitle, a.originalBody)) {
      await prisma.article.update({
        where: { id: a.id },
        data: { category: "날씨" }
      });
      updated++;
      console.log(`  → ${a.originalTitle.slice(0, 50)}`);
    }
  }

  console.log(`\n총 ${updated}건을 '날씨' 카테고리로 재분류했어요.`);

  const total = await prisma.article.count({ where: { category: "날씨" } });
  const ready = await prisma.article.count({ where: { category: "날씨", status: "ready" } });
  console.log(`현재 날씨 카테고리: 총 ${total}건 (변환 완료 ${ready}건)`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
