import dotenv from "dotenv";
dotenv.config({ override: true });
import { crawlAll } from "../src/lib/crawler";

async function main() {
  console.log("RSS 크롤링 시작...");
  const results = await crawlAll();
  let totalNew = 0;
  for (const r of results) {
    console.log(`  ${r.source}: ${r.fetched}개 발견, ${r.inserted}개 신규`);
    totalNew += r.inserted;
  }
  console.log(`\n총 신규 기사: ${totalNew}개`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
