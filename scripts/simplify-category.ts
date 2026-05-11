import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";
import { simplifyArticle } from "../src/lib/claude";

async function main() {
  const category = process.argv[2];
  if (!category) {
    console.error("사용법: tsx scripts/simplify-category.ts <카테고리>");
    process.exit(1);
  }

  const pending = await prisma.article.findMany({
    where: {
      category,
      status: { in: ["pending", "error"] }
    },
    orderBy: { publishedAt: "desc" }
  });

  console.log(`${category} 카테고리 변환 대기: ${pending.length}건`);
  const start = Date.now();
  let ok = 0;
  let fail = 0;

  for (const article of pending) {
    try {
      const { easyTitle, easyBody } = await simplifyArticle({
        title: article.originalTitle,
        body: article.originalBody
      });
      await prisma.article.update({
        where: { id: article.id },
        data: { easyTitle, easyBody, status: "ready", simplifiedAt: new Date() }
      });
      ok++;
      console.log(`  ✓ ${article.originalTitle.slice(0, 50)}`);
    } catch (e) {
      await prisma.article.update({
        where: { id: article.id },
        data: { status: "error" }
      });
      fail++;
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n완료 (${elapsed}초): 성공 ${ok}, 실패 ${fail}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
