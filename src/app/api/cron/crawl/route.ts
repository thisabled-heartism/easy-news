import { NextResponse } from "next/server";
import { crawlAll } from "@/lib/crawler";
import { simplifyPending } from "@/lib/claude";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const crawled = await crawlAll();
  const simplified = await simplifyPending(30);

  return NextResponse.json({ crawled, simplified, ranAt: new Date().toISOString() });
}
