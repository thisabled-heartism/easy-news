import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./db";

let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (_anthropic) return _anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY가 설정되지 않았어요. .env 파일을 확인하세요.");
  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
}

const MODEL = () => process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `당신은 발달장애인을 위한 '쉬운말' 뉴스 작성자입니다.

다음 규칙을 반드시 지키세요:
1. 한 문장은 짧게 씁니다 (15~20자 권장, 최대 30자).
2. 한 문단은 짧은 문장 2~3개로 구성합니다.
3. 어려운 한자어, 외래어, 전문용어는 쉬운 우리말로 풀어 씁니다.
   (예: "체결" → "맺다", "협약" → "약속", "GDP" → "한 나라가 1년 동안 번 돈")
4. 처음 나오는 어려운 말은 괄호 안에 짧게 뜻풀이를 합니다.
5. 추상적이거나 비유적인 표현 대신 구체적인 사실을 씁니다.
6. 한 뉴스에는 한 가지 주제만 담습니다.
7. 누가, 언제, 어디서, 무엇을, 왜, 어떻게의 순서로 정리합니다.
8. 능동형 문장을 씁니다 ("발표되었다" 대신 "ㅇㅇ가 알렸다").
9. 부정문보다 긍정문을 씁니다.
10. 차별적이거나 어려운 표현은 쓰지 않습니다.

출력 형식은 반드시 아래 JSON 형식으로만 답하세요. 다른 설명은 절대 쓰지 마세요.

{
  "easyTitle": "쉬운말 제목 (15자 이내)",
  "easyBody": "쉬운말 본문 (3~6 문단, 각 문단 사이 빈 줄)"
}`;

export async function simplifyArticle(input: {
  title: string;
  body: string;
}): Promise<{ easyTitle: string; easyBody: string }> {
  const userMessage = `[원본 제목]
${input.title}

[원본 본문]
${input.body}`;

  const response = await getClient().messages.create({
    model: MODEL(),
    max_tokens: 1500,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" }
      }
    ],
    messages: [{ role: "user", content: userMessage }]
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return text");
  }

  const text = textBlock.text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Claude returned non-JSON: ${text.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);
  if (typeof parsed.easyTitle !== "string" || typeof parsed.easyBody !== "string") {
    throw new Error("Claude JSON missing required fields");
  }

  return { easyTitle: parsed.easyTitle, easyBody: parsed.easyBody };
}

export async function simplifyPending(limit = 20) {
  const pending = await prisma.article.findMany({
    where: { status: { in: ["pending", "error"] } },
    orderBy: { publishedAt: "desc" },
    take: limit
  });

  const results = { ok: 0, fail: 0 };

  for (const article of pending) {
    try {
      const { easyTitle, easyBody } = await simplifyArticle({
        title: article.originalTitle,
        body: article.originalBody
      });

      await prisma.article.update({
        where: { id: article.id },
        data: {
          easyTitle,
          easyBody,
          status: "ready",
          simplifiedAt: new Date()
        }
      });
      results.ok++;
    } catch (e) {
      console.error(`[claude] simplify fail: ${article.id}`, e);
      await prisma.article.update({
        where: { id: article.id },
        data: { status: "error" }
      });
      results.fail++;
    }
  }

  return results;
}
