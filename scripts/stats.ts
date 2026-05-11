import dotenv from "dotenv";
dotenv.config({ override: true });
import { prisma } from "../src/lib/db";

async function main() {
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

  console.log("카테고리".padEnd(10) + "ready".padStart(8) + "pending".padStart(10) + "error".padStart(8));
  console.log("-".repeat(36));
  for (const cat of Object.keys(grouped).sort()) {
    const r = grouped[cat].ready ?? 0;
    const p = grouped[cat].pending ?? 0;
    const e = grouped[cat].error ?? 0;
    console.log(cat.padEnd(10) + String(r).padStart(8) + String(p).padStart(10) + String(e).padStart(8));
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
