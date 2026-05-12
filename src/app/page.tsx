import Link from "next/link";
import { prisma } from "@/lib/db";
import { catStyle } from "@/lib/category";
import { WeatherWidget } from "@/components/WeatherWidget";
import { kstDayString, kstDayRange, shiftDay, dateLabel, midDateLabel, fullDateLabel, shortTime } from "@/lib/date-utils";

export const revalidate = 300;

type SearchParams = { category?: string; date?: string };

function buildHref(params: { date?: string; category?: string }): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.date) sp.set("date", params.date);
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category, date: dateParam } = await searchParams;

  // 날씨 카테고리는 위젯만
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

  const today = kstDayString(new Date());
  const targetDay = dateParam ?? today;
  const prevDay = shiftDay(targetDay, -1);
  const nextDay = shiftDay(targetDay, +1);
  const isToday = targetDay === today;

  const { start, end } = kstDayRange(targetDay);
  const articles = await prisma.article.findMany({
    where: {
      status: "ready",
      publishedAt: { gte: start, lt: end },
      ...(category ? { category } : {})
    },
    orderBy: { publishedAt: "desc" }
  });

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 leading-tight mb-1">
          {category ? `${category} 뉴스` : "쉬운 뉴스"}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {category ? `'${category}' 카테고리` : "어려운 뉴스를 쉬운말로 풀어 드려요"}
        </p>
      </div>

      {/* 날짜 네비 (한 줄, 모바일 친화) */}
      <div className="flex items-center justify-between gap-2 mb-8">
        <Link
          href={buildHref({ category, date: prevDay })}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 md:px-4 py-2.5 rounded-xl bg-white border-2 border-gray-100 hover:border-purple-300 active:border-purple-400 transition font-bold whitespace-nowrap no-underline text-gray-700 hover:text-purple-700"
          aria-label={`이전 날짜 ${dateLabel(prevDay)}로 이동`}
        >
          <span className="text-lg">←</span>
          <span className="text-xs md:text-sm">{dateLabel(prevDay)}</span>
        </Link>

        <div className="text-center flex-1 min-w-0 px-1">
          <div className="text-[10px] md:text-xs text-purple-600 font-bold mb-0.5 whitespace-nowrap">
            {isToday ? "📅 오늘" : "📅"}
          </div>
          <div className="text-sm md:text-base font-black tracking-tight text-gray-900 whitespace-nowrap">
            <span className="md:hidden">{midDateLabel(targetDay)}</span>
            <span className="hidden md:inline">{fullDateLabel(targetDay)}</span>
          </div>
        </div>

        {isToday ? (
          <div className="shrink-0 inline-flex items-center gap-1.5 px-3 md:px-4 py-2.5 rounded-xl bg-gray-50 text-gray-300 font-bold whitespace-nowrap cursor-not-allowed">
            <span className="text-xs md:text-sm">최신</span>
            <span className="text-lg">→</span>
          </div>
        ) : (
          <Link
            href={buildHref({ category, date: nextDay === today ? undefined : nextDay })}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 md:px-4 py-2.5 rounded-xl bg-white border-2 border-gray-100 hover:border-purple-300 active:border-purple-400 transition font-bold whitespace-nowrap no-underline text-gray-700 hover:text-purple-700"
            aria-label={`다음 날짜 ${dateLabel(nextDay)}로 이동`}
          >
            <span className="text-xs md:text-sm">{dateLabel(nextDay)}</span>
            <span className="text-lg">→</span>
          </Link>
        )}
      </div>

      {!featured ? (
        <div className="text-center py-16 animate-fadeIn">
          <p className="text-2xl font-black text-gray-700 mb-2">이 날에는 뉴스가 없어요</p>
          <p className="text-base text-gray-500">화살표로 다른 날짜로 가 보세요.</p>
        </div>
      ) : (
        <>
          {/* 메인 카드 */}
          <Link
            href={`/news/${featured.id}`}
            className="block w-full text-left mb-8 bg-white border-3 border-gray-100 hover:border-purple-300 rounded-3xl p-6 md:p-8 group transition no-underline"
          >
            <div className="flex items-start gap-4 md:gap-6">
              <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br ${catStyle(featured.category).gradFrom} ${catStyle(featured.category).gradTo} flex items-center justify-center text-3xl md:text-5xl flex-shrink-0`}>
                {catStyle(featured.category).emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {featured.category && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${catStyle(featured.category).bg} ${catStyle(featured.category).text}`}>
                      #{featured.category}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-yellow-300 text-yellow-900">
                    ⭐ 주요 뉴스
                  </span>
                </div>
                <h2 className="text-xl md:text-3xl font-black tracking-tight text-gray-900 leading-snug mb-3 group-hover:text-purple-700">
                  {featured.easyTitle ?? featured.originalTitle}
                </h2>
                <p className="text-sm text-gray-500">
                  {shortTime(featured.publishedAt)} · {featured.source}
                </p>
              </div>
            </div>
          </Link>

          {/* 나머지 그리드 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {rest.map((a) => {
              const style = catStyle(a.category);
              return (
                <Link
                  key={a.id}
                  href={`/news/${a.id}`}
                  className="text-left bg-white border-3 border-gray-100 hover:border-purple-300 rounded-2xl p-5 md:p-6 group transition no-underline"
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

          <div className="text-center text-sm text-gray-400">
            이 날 {articles.length}개의 뉴스
          </div>
        </>
      )}
    </div>
  );
}
