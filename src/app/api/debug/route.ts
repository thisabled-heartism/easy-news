import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  // CRON_SECRET으로 보호 (배포 후 임시 디버깅 용도)
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const key = process.env.ANTHROPIC_API_KEY ?? "";
  const model = process.env.CLAUDE_MODEL ?? "(unset)";

  const envInfo = {
    apiKey_set: !!key,
    apiKey_length: key.length,
    apiKey_prefix: key.slice(0, 12),
    apiKey_suffix: key.slice(-6),
    apiKey_hasWhitespace: /\s/.test(key),
    apiKey_hasQuotes: key.includes('"') || key.includes("'"),
    model,
    cronSecret_set: !!process.env.CRON_SECRET,
    dbUrl_set: !!process.env.DATABASE_URL,
    dbUrl_prefix: process.env.DATABASE_URL?.slice(0, 20)
  };

  // API 실제 호출 테스트
  let apiTest: any = { skipped: true };
  if (key) {
    try {
      const client = new Anthropic({ apiKey: key });
      const res = await client.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: "user", content: "한 글자만: 안" }]
      });
      apiTest = {
        ok: true,
        text: res.content[0]?.type === "text" ? res.content[0].text : "(no text)",
        usage: res.usage
      };
    } catch (e: any) {
      apiTest = {
        ok: false,
        error: e?.message ?? String(e),
        status: e?.status,
        type: e?.error?.type,
        details: e?.error?.error
      };
    }
  }

  return NextResponse.json({ env: envInfo, apiTest });
}
