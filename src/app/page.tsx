import Link from "next/link";
import { prisma } from "@/lib/db";
import { catStyle } from "@/lib/category";
import { WeatherWidget } from "@/components/WeatherWidget";
import { kstDayString, kstDayRange, shiftDay, dateLabel, fullDateLabel, shortTime } from "@/lib/date-utils";

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

  // 해당 KST 날짜에 발행된 기사만
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

  // 네비게이션 컴포넌트
  const Navigation = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <Link
        href={buildHref({ category, date: prevDay })}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border-3 border-gray-100 hover:border-purple-300 text-gray-700 font-bold no-underline transition group flex-1 max-w-[200px]"
      >
        <span className="text-2xl group-hover:text-purple-700">←</span>
        <div className="leading-tight text-left">
          <div className="text-xs text-gray-500">이전 날짜</div>
          <div className="text-sm font-black group-hover:text-purple-700">{dateLabel(prevDay)}</div>
        </div>
      </Link>

      <div className="text-center px-2">
        <div className="text-xs text-gray-500">{isToday ? "📅 오늘" : "📅"}</div>
        <div className="text-base md:text-lg font-black tracking-tight text-gray-900 whitespace-nowrap">
          {fullDateLabel(targetDay)}
        </div>
      </div>

      {isToday ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 text-gray-300 font-bold flex-1 max-w-[200px] justify-end cursor-not-allowed">
          <div className="leading-tight text-right">
            <div className="text-xs">다음 날짜</div>
            <div className="text-sm font-black">아직 없어요</div>
          </div>
          <span className="text-2xl">→</span>
        </div>
      ) : (
        <Link
          href={buildHref({ category, date: nextDay === today ? undefined : nextDay })}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border-3 border-gray-100 hover:border-purple-300 text-gray-700 font-bold no-underline transition group flex-1 max-w-[200px] justify-end"
        >
          <div className="leading-tight text-right">
            <div className="text-xs text-gray-500">다음 날짜</div>
            <div className="text-sm font-black group-hover:text-purple-700">{dateLabel(nextDay)}</div>
          </div>
          <span className="text-2xl group-hover:text-purple-700">→</span>
        </Link>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-tight mb-2">
          {category ? `${category} 뉴스` : "쉬운 뉴스"}
        </h1>
        <p className="text-base text-gray-600">
          {category ? `'${category}' 카테고리예요` : "어려운 뉴스를 쉬운말로 풀어 드려요"}
        </p>
      </div>

      {/* 상단 날짜 네비 */}
      <Navigation className="mb-10" />

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
            className="block w-full text-left mb-8 bg-white border-3 border-gray-100 hover:border-purple-300 rounded-3xl p-8 group transition no-underline"
          >
            <div className="flex items-start gap-6">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${catStyle(featured.category).gradFrom} ${catStyle(featured.category).gradTo} flex items-center justify-center text-5xl flex-shrink-0`}>
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
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 leading-snug mb-3 group-hover:text-purple-700">
                  {featured.easyTitle ?? featured.originalTitle}
                </h2>
                <p className="text-sm text-gray-500">
                  {shortTime(featured.publishedAt)} · {featured.source}
                </p>
              </div>
            </div>
          </Link>

          {/* 나머지 그리드 */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {rest.map((a) => {
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

          <div className="text-center text-sm text-gray-400 mb-8">
            {fullDateLabel(targetDay)}에 {articles.length}개의 뉴스
          </div>
        </>
      )}

      {/* 하단 날짜 네비 (다시 한 번) */}
      <Navigation />
    </div>
  );
}
