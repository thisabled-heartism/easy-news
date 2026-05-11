import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";
import { writeFileSync } from "fs";

async function main() {
  const all = await prisma.article.findMany();
  console.log(`총 ${all.length}건 추출 중...`);

  const data = all.map(a => ({
    ...a,
    publishedAt: a.publishedAt.toISOString(),
    crawledAt: a.crawledAt.toISOString(),
    simplifiedAt: a.simplifiedAt?.toISOString() ?? null
  }));

  writeFileSync("./backup-articles.json", JSON.stringify(data, null, 2), "utf-8");

  const ready = all.filter(a => a.status === "ready").length;
  const pending = all.filter(a => a.status === "pending").length;
  const error = all.filter(a => a.status === "error").length;

  console.log(`✅ backup-articles.json 저장 완료`);
  console.log(`   ready: ${ready}, pending: ${pending}, error: ${error}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
