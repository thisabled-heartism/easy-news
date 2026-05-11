import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";
import { readFileSync } from "fs";

async function main() {
  const raw = readFileSync("./backup-articles.json", "utf-8");
  const articles = JSON.parse(raw) as Array<Record<string, any>>;

  console.log(`총 ${articles.length}건 가져오기 시작...`);

  let ok = 0;
  let skip = 0;

  // 청크 단위로 처리 (네트워크 효율)
  const CHUNK = 50;
  for (let i = 0; i < articles.length; i += CHUNK) {
    const chunk = articles.slice(i, i + CHUNK);
    const data = chunk.map(a => ({
      id: a.id,
      source: a.source,
      sourceUrl: a.sourceUrl,
      originalTitle: a.originalTitle,
      originalBody: a.originalBody,
      easyTitle: a.easyTitle,
      easyBody: a.easyBody,
      category: a.category,
      publishedAt: new Date(a.publishedAt),
      crawledAt: new Date(a.crawledAt),
      simplifiedAt: a.simplifiedAt ? new Date(a.simplifiedAt) : null,
      status: a.status,
      imageUrl: a.imageUrl
    }));

    const result = await prisma.article.createMany({
      data,
      skipDuplicates: true
    });

    ok += result.count;
    skip += chunk.length - result.count;
    console.log(`  ${Math.min(i + CHUNK, articles.length)}/${articles.length} 진행 (성공 ${ok}, 중복 스킵 ${skip})`);
  }

  console.log(`\n✅ 완료! 가져옴: ${ok}, 중복 스킵: ${skip}`);

  // 최종 확인
  const total = await prisma.article.count();
  const ready = await prisma.article.count({ where: { status: "ready" } });
  console.log(`\n현재 Neon DB: 총 ${total}건 (ready ${ready})`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
