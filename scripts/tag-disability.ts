import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";
import { isDisabilityArticle } from "../src/lib/disability-detect";

async function main() {
  const all = await prisma.article.findMany({
    where: { NOT: { category: "발달장애" } }
  });

  console.log(`전체 ${all.length}건 검사 중...`);
  let tagged = 0;

  for (const a of all) {
    if (isDisabilityArticle(a.originalTitle)) {
      await prisma.article.update({
        where: { id: a.id },
        data: { category: "발달장애" }
      });
      tagged++;
      console.log(`  💜 ${a.originalTitle.slice(0, 60)}`);
    }
  }

  console.log(`\n총 ${tagged}건을 '발달장애' 카테고리로 분류했어요.`);

  const stats = await prisma.article.groupBy({
    by: ["category", "status"],
    _count: { id: true }
  });
  const grouped: Record<string, Record<string, number>> = {};
  for (const s of stats) {
    const cat = s.category ?? "(none)";
    grouped[cat] = grouped[cat] ?? {};
    grouped[cat][s.status] = s._count.id;
  }
  console.log("\n=== 카테고리별 ===");
  for (const cat of Object.keys(grouped).sort()) {
    const r = grouped[cat].ready ?? 0;
    const p = grouped[cat].pending ?? 0;
    console.log(`  ${cat}: ready ${r} / pending ${p}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
