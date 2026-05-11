// wttr.in 무료 날씨 API (키 불필요)

export type CurrentWeather = {
  tempC: string;
  feelsLikeC: string;
  humidity: string;
  desc: string;
  emoji: string;
};

export type DailyForecast = {
  date: string;
  weekday: string;
  maxC: string;
  minC: string;
  desc: string;
  emoji: string;
  rainChance: string;
};

export type WeatherData = {
  city: string;
  current: CurrentWeather;
  forecast: DailyForecast[];
  fetchedAt: string;
};

const DESC_KO: Record<string, { ko: string; emoji: string }> = {
  "Sunny": { ko: "맑음", emoji: "☀️" },
  "Clear": { ko: "맑음", emoji: "🌙" },
  "Partly cloudy": { ko: "구름 조금", emoji: "⛅" },
  "Cloudy": { ko: "흐림", emoji: "☁️" },
  "Overcast": { ko: "잔뜩 흐림", emoji: "☁️" },
  "Mist": { ko: "옅은 안개", emoji: "🌫️" },
  "Fog": { ko: "안개", emoji: "🌫️" },
  "Freezing fog": { ko: "어는 안개", emoji: "🌫️" },
  "Patchy rain nearby": { ko: "곳에 따라 비", emoji: "🌦️" },
  "Patchy rain possible": { ko: "비 올 수 있음", emoji: "🌦️" },
  "Light rain": { ko: "약한 비", emoji: "🌧️" },
  "Moderate rain": { ko: "비", emoji: "🌧️" },
  "Heavy rain": { ko: "강한 비", emoji: "⛈️" },
  "Light rain shower": { ko: "약한 소나기", emoji: "🌦️" },
  "Moderate or heavy rain shower": { ko: "소나기", emoji: "🌧️" },
  "Patchy snow possible": { ko: "눈 올 수 있음", emoji: "🌨️" },
  "Light snow": { ko: "약한 눈", emoji: "🌨️" },
  "Moderate snow": { ko: "눈", emoji: "❄️" },
  "Heavy snow": { ko: "많은 눈", emoji: "❄️" },
  "Thundery outbreaks possible": { ko: "천둥 칠 수 있음", emoji: "⛈️" },
  "Patchy light rain with thunder": { ko: "비와 천둥", emoji: "⛈️" },
  "Moderate or heavy rain with thunder": { ko: "강한 비와 천둥", emoji: "⛈️" }
};

function translate(desc: string): { ko: string; emoji: string } {
  return DESC_KO[desc] ?? { ko: desc, emoji: "🌤️" };
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export async function getSeoulWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch("https://wttr.in/Seoul?format=j1", {
      next: { revalidate: 1800 }, // 30분 캐시
      headers: { "User-Agent": "Mozilla/5.0 (curl)" }
    });
    if (!res.ok) return null;
    const data = await res.json();

    const c = data.current_condition?.[0];
    if (!c) return null;
    const currentDesc = c.weatherDesc?.[0]?.value ?? "";
    const currentT = translate(currentDesc);

    const forecast: DailyForecast[] = (data.weather ?? []).slice(0, 5).map((w: any) => {
      const noon = w.hourly?.find((h: any) => h.time === "1200") ?? w.hourly?.[4];
      const desc = noon?.weatherDesc?.[0]?.value ?? "";
      const t = translate(desc);
      const d = new Date(w.date);
      return {
        date: w.date,
        weekday: WEEKDAYS[d.getDay()],
        maxC: w.maxtempC,
        minC: w.mintempC,
        desc: t.ko,
        emoji: t.emoji,
        rainChance: noon?.chanceofrain ?? "0"
      };
    });

    return {
      city: "서울",
      current: {
        tempC: c.temp_C,
        feelsLikeC: c.FeelsLikeC,
        humidity: c.humidity,
        desc: currentT.ko,
        emoji: currentT.emoji
      },
      forecast,
      fetchedAt: new Date().toISOString()
    };
  } catch (e) {
    console.error("[weather] fetch fail", e);
    return null;
  }
}
