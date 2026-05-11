import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  const total = await prisma.article.count();
  const ready = await prisma.article.count({ where: { status: "ready" } });
  const pending = await prisma.article.count({ where: { status: "pending" } });
  const error = await prisma.article.count({ where: { status: "error" } });

  console.log(`총 기사: ${total}`);
  console.log(`  - ready: ${ready}`);
  console.log(`  - pending: ${pending}`);
  console.log(`  - error: ${error}`);

  const sample = await prisma.article.findFirst({
    where: { status: "ready" },
    orderBy: { simplifiedAt: "desc" }
  });

  if (sample) {
    console.log("\n=== 변환된 기사 샘플 ===");
    console.log("원본:", sample.originalTitle);
    console.log("쉬운말:", sample.easyTitle);
    console.log("\n쉬운말 본문:");
    console.log(sample.easyBody);
  }
}

main().finally(() => process.exit(0));
