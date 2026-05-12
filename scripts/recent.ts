import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";

async function main() {
  const recent = await prisma.article.findMany({
    where: { status: "ready" },
    orderBy: { publishedAt: "desc" },
    take: 15,
    select: { publishedAt: true, easyTitle: true, source: true, status: true, simplifiedAt: true }
  });

  console.log("=== 최근 기사 15건 (publishedAt 기준) ===");
  for (const a of recent) {
    const pub = a.publishedAt.toISOString().slice(0, 16);
    const simp = a.simplifiedAt?.toISOString().slice(0, 16) ?? "-";
    console.log(`pub:${pub} simp:${simp} | ${a.source.slice(0, 12)} | ${a.easyTitle?.slice(0, 40)}`);
  }

  console.log("\n=== 오늘 (KST 2026-05-12) 기사 ===");
  const today = await prisma.article.count({
    where: {
      publishedAt: {
        gte: new Date("2026-05-11T15:00:00Z"), // KST 00:00 = UTC 15:00 전날
        lt: new Date("2026-05-12T15:00:00Z")
      }
    }
  });
  console.log(`총 ${today}건`);

  console.log("\n=== 오늘 변환 완료된 것 ===");
  const todayReady = await prisma.article.count({
    where: {
      status: "ready",
      simplifiedAt: {
        gte: new Date("2026-05-11T15:00:00Z"),
        lt: new Date("2026-05-12T15:00:00Z")
      }
    }
  });
  console.log(`${todayReady}건`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
