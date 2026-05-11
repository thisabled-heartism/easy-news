import dotenv from "dotenv";
dotenv.config({ override: true });
import { crawlAll } from "../src/lib/crawler";
import { simplifyPending } from "../src/lib/claude";

async function main() {
  console.log("=== 1단계: 뉴스 수집 ===");
  const crawled = await crawlAll();
  console.table(crawled);

  console.log("\n=== 2단계: 쉬운말 변환 ===");
  const simplified = await simplifyPending(30);
  console.log(simplified);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
