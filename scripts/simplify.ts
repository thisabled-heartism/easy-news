import dotenv from "dotenv";
dotenv.config({ override: true });
import { simplifyPending } from "../src/lib/claude";

async function main() {
  const limit = parseInt(process.argv[2] || "30", 10);
  console.log(`쉬운말 변환 시작 (최대 ${limit}건)...`);
  const start = Date.now();
  const result = await simplifyPending(limit);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n완료! (${elapsed}초)`);
  console.log(`  성공: ${result.ok}`);
  console.log(`  실패: ${result.fail}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));
