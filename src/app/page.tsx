import Link from "next/link";
import { prisma } from "@/lib/db";
import { catStyle } from "@/lib/category";
import { WeatherWidget } from "@/components/WeatherWidget";
import { groupByDay, shortTime, kstDayString } from "@/lib/date-utils";

export const revalidate = 300;

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // 날씨 카테고리는 위젯만 표시
  if (category === "날씨") {
    return (
      <div className="animate-fadeIn">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-tight mb-2">
            날씨
          </h1>
          <p className="text-base text-gray-600">서울의 오늘과 이번 주 날씨예요</p>
        </div>
        <WeatherWidget />
      </div>
    );
  }

  // 충분히 많이 가져와서 여러 날짜 커버
  const articles = await prisma.article.findMany({
    where: {
      status: "ready",
      ...(category ? { category } : {})
    },
    orderBy: { publishedAt: "desc" },
    take: 300
  });

  if (articles.length === 0) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <p className="text-2xl font-black text-gray-700 mb-2">아직 준비된 뉴스가 없어요</p>
        <p className="text-base text-gray-500">잠시 뒤에 다시 와 주세요.</p>
        {category && (
          <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">
            ← 전체 뉴스 보기
          </Link>
        )}
      </div>
    );
  }

  // 메인 카드 = 가장 최신 1개
  const featured = articles[0];
  const featuredStyle = catStyle(featured.category);
  const today = kstDayString(new Date());

  // 나머지를 날짜별로 그룹화, 날짜당 최대 개수 제한 (오늘 49 + 메인 1 = 50, 다른 날 20)
  const groups = groupByDay(articles.slice(1));
  const groupsWithMore: Array<{ day: string; label: string; items: typeof articles; totalCount: number }> = [];
  groups.forEach((g, idx) => {
    const limit = idx === 0 ? 49 : 19;
    const totalCount = g.items.length;
    const items = totalCount > limit ? g.items.slice(0, limit) : g.items;
    groupsWithMore.push({ ...g, items, totalCount });
  });

  return (
    <div className="animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-tight mb-2">
          {category ? `${category} 뉴스` : "오늘의 쉬운 뉴스"}
        </h1>
        <p className="text-base text-gray-600">
          {category ? `'${category}' 카테고리 뉴스를 모았어요` : "어려운 뉴스를 쉬운말로 풀어 드려요"}
        </p>
      </div>

      {/* 메인 뉴스 (최신 1개) */}
      <Link
        href={`/news/${featured.id}`}
        className="block w-full text-left mb-12 bg-white border-3 border-gray-100 hover:border-purple-300 rounded-3xl p-8 group transition no-underline"
      >
        <div className="flex items-start gap-6">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${featuredStyle.gradFrom} ${featuredStyle.gradTo} flex items-center justify-center text-5xl flex-shrink-0`}>
            {featuredStyle.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {featured.category && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${featuredStyle.bg} ${featuredStyle.text}`}>
                  #{featured.category}
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-yellow-300 text-yellow-900">
                ⭐ 최신 뉴스
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 leading-snug mb-3 group-hover:text-purple-700">
              {featured.easyTitle ?? featured.originalTitle}
            </h2>
            <p className="text-sm text-gray-500">
              {shortTime(featured.publishedAt)} · {featured.source}
            </p>
          </div>
        </div>
      </Link>

      {/* 날짜별 섹션 */}
      {groupsWithMore.map((group) => {
        const isToday = group.day === today;
        const hasMore = group.totalCount > group.items.length;
        return (
          <section key={group.day} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className={`h-1 flex-1 rounded-full ${isToday ? "bg-purple-200" : "bg-gray-200"}`}></div>
              <h3 className={`text-base font-black tracking-tight whitespace-nowrap ${isToday ? "text-purple-700" : "text-gray-600"}`}>
                {group.label}
                {hasMore && <span className="ml-2 text-xs font-medium text-gray-400">({group.totalCount}개 중 {group.items.length}개)</span>}
              </h3>
              <div className={`h-1 flex-1 rounded-full ${isToday ? "bg-purple-200" : "bg-gray-200"}`}></div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {group.items.map((a) => {
                const style = catStyle(a.category);
                return (
                  <Link
                    key={a.id}
                    href={`/news/${a.id}`}
                    className="text-left bg-white border-3 border-gray-100 hover:border-purple-300 rounded-2xl p-6 group transition no-underline"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.gradFrom} ${style.gradTo} flex items-center justify-center text-3xl flex-shrink-0`}>
                        {style.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        {a.category && (
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${style.bg} ${style.text} mb-2`}>
                            #{a.category}
                          </span>
                        )}
                        <h3 className="text-lg font-black tracking-tight text-gray-900 leading-snug mb-2 group-hover:text-purple-700">
                          {a.easyTitle ?? a.originalTitle}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {shortTime(a.publishedAt)} · {a.source}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="mt-12 text-center text-sm text-gray-400">
        총 {1 + groupsWithMore.reduce((s, g) => s + g.items.length, 0)}개의 뉴스를 보고 계세요
      </div>
    </div>
  );
}
