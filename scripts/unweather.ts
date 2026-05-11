import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";

function originalCategory(source: string): string {
  if (source.includes("정치")) return "정치";
  if (source.includes("경제")) return "경제";
  if (source.includes("문화") || source.includes("생활")) return "문화";
  if (source.includes("사회")) return "사회";
  if (source.includes("경향")) return "종합";
  return "종합";
}

async function main() {
  const weatherArticles = await prisma.article.findMany({
    where: { category: "날씨" }
  });
  console.log(`날씨 분류 ${weatherArticles.length}건 → 원래 카테고리로 되돌리는 중...`);

  for (const a of weatherArticles) {
    const newCat = originalCategory(a.source);
    await prisma.article.update({
      where: { id: a.id },
      data: { category: newCat }
    });
    console.log(`  ${a.source} → ${newCat}: ${a.originalTitle.slice(0, 40)}`);
  }

  const byCategory = await prisma.article.groupBy({
    by: ["category"],
    _count: { id: true }
  });
  console.log("\n=== 최종 카테고리별 ===");
  byCategory.forEach(c => console.log(`  ${c.category}: ${c._count.id}건`));
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
