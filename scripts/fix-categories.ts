import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";
import { isWeatherArticle } from "../src/lib/weather-detect";

// 소스 이름 → 원래 카테고리 매핑
function originalCategory(source: string): string {
  if (source.includes("정치")) return "정치";
  if (source.includes("문화") || source.includes("생활")) return "문화";
  if (source.includes("사회")) return "사회";
  if (source.includes("경향")) return "종합";
  return "종합";
}

async function main() {
  const all = await prisma.article.findMany();
  console.log(`전체 ${all.length}건 검사 중...`);

  let toWeather = 0;
  let restored = 0;

  for (const a of all) {
    const isWeather = isWeatherArticle(a.originalTitle, a.originalBody);
    const expected = isWeather ? "날씨" : originalCategory(a.source);

    if (a.category !== expected) {
      await prisma.article.update({
        where: { id: a.id },
        data: { category: expected }
      });
      if (expected === "날씨") toWeather++;
      else restored++;
    }
  }

  console.log(`\n날씨로 분류: ${toWeather}건`);
  console.log(`원래 카테고리로 복원: ${restored}건`);

  // 카테고리별 집계
  const byCategory = await prisma.article.groupBy({
    by: ["category"],
    _count: { id: true }
  });
  console.log("\n=== 카테고리별 집계 ===");
  for (const c of byCategory) {
    console.log(`  ${c.category ?? "없음"}: ${c._count.id}건`);
  }

  // 날씨 카테고리만 ready 상태 확인
  const weatherReady = await prisma.article.count({
    where: { category: "날씨", status: "ready" }
  });
  const weatherTotal = await prisma.article.count({
    where: { category: "날씨" }
  });
  console.log(`\n날씨: 변환 완료 ${weatherReady} / 총 ${weatherTotal}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
