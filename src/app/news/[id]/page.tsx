import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { catStyle } from "@/lib/category";
import { TtsButton } from "@/components/TtsButton";

export const revalidate = 600;

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { title: "뉴스를 찾을 수 없어요" };

  const desc = (article.easyBody ?? article.originalBody).slice(0, 150).replace(/\n/g, " ");

  return {
    title: article.easyTitle ?? article.originalTitle,
    description: desc,
    keywords: [article.category, "쉬운말 뉴스", "하티즘", "발달장애"].filter(Boolean) as string[],
    openGraph: {
      title: article.easyTitle ?? article.originalTitle,
      description: desc,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      url: `https://heartismnews.co.kr/news/${article.id}`
    }
  };
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
function formatLongDate(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일`;
}

export default async function NewsDetail({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article || article.status !== "ready") notFound();

  const paragraphs = (article.easyBody ?? "").split(/\n\s*\n/).filter(Boolean);
  const style = catStyle(article.category);

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 hover:text-purple-900 mb-6 no-underline"
      >
        ← 뉴스 목록으로
      </Link>

      <article className="bg-white border-3 border-gray-100 rounded-3xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.gradFrom} ${style.gradTo} flex items-center justify-center text-4xl`}>
            {style.emoji}
          </div>
          {article.category && (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-black ${style.bg} ${style.text}`}>
              #{article.category}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-tight mb-4">
          {article.easyTitle}
        </h1>

        <p className="text-sm text-gray-500 mb-6 pb-6 border-b-2 border-gray-100">
          {formatLongDate(article.publishedAt)}
        </p>

        <TtsButton bodyId="easy-body" />

        <div id="easy-body" className="easy-body">
          {paragraphs.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, "<br/>") }} />
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-yellow-50 border-2 border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📎</span>
            <span className="font-black text-purple-900">원문 출처</span>
          </div>
          <p className="text-sm text-gray-700 mb-3">{article.source}</p>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 hover:text-purple-900 underline underline-offset-4"
          >
            원문 기사 보러 가기 →
          </a>
        </div>
      </article>
    </div>
  );
}
