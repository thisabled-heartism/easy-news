import { getSeoulWeather } from "@/lib/weather";

export async function WeatherWidget() {
  const data = await getSeoulWeather();
  if (!data) return null;

  const today = data.forecast[0];
  const week = data.forecast.slice(0, 5);

  return (
    <div className="mb-10 bg-gradient-to-br from-sky-50 via-white to-amber-50 border-3 border-sky-100 rounded-3xl p-8">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📍</span>
        <h2 className="text-xl font-black tracking-tight text-gray-900">{data.city} 날씨</h2>
        <span className="ml-auto text-xs text-gray-400">30분마다 업데이트</span>
      </div>

      {/* 오늘 날씨 (메인) */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-sky-100">
        <div className="text-7xl">{data.current.emoji}</div>
        <div className="flex-1">
          <div className="text-5xl font-black tracking-tight text-gray-900 mb-2">
            {data.current.tempC}°
          </div>
          <div className="text-lg font-bold text-gray-700 mb-1">{data.current.desc}</div>
          <div className="text-sm text-gray-500">
            체감 {data.current.feelsLikeC}° · 습도 {data.current.humidity}%
            {today && ` · 최고 ${today.maxC}° / 최저 ${today.minC}°`}
          </div>
        </div>
      </div>

      {/* 이번주 예보 */}
      <div>
        <h3 className="text-sm font-black text-gray-700 mb-4">이번 주 날씨</h3>
        <div className="grid grid-cols-5 gap-2">
          {week.map((d, i) => {
            const isToday = i === 0;
            return (
              <div
                key={d.date}
                className={`text-center rounded-2xl p-3 ${
                  isToday ? "bg-purple-100 border-2 border-purple-300" : "bg-white border border-gray-100"
                }`}
              >
                <div className={`text-xs font-bold mb-2 ${isToday ? "text-purple-700" : "text-gray-500"}`}>
                  {isToday ? "오늘" : d.weekday}
                </div>
                <div className="text-3xl mb-1">{d.emoji}</div>
                <div className="text-xs text-gray-600 mb-2 truncate" title={d.desc}>{d.desc}</div>
                <div className="text-xs">
                  <span className="font-bold text-red-600">{d.maxC}°</span>
                  <span className="text-gray-400"> / </span>
                  <span className="font-bold text-blue-600">{d.minC}°</span>
                </div>
                {parseInt(d.rainChance) > 30 && (
                  <div className="text-[10px] text-blue-500 mt-1">☔ {d.rainChance}%</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
