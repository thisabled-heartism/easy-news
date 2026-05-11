export type NewsSource = {
  name: string;
  rss: string;
  category?: string;
};

export const NEWS_SOURCES: NewsSource[] = [
  { name: "연합뉴스 - 사회", rss: "https://www.yna.co.kr/rss/society.xml", category: "사회" },
  { name: "연합뉴스 - 정치", rss: "https://www.yna.co.kr/rss/politics.xml", category: "정치" },
  { name: "연합뉴스 - 생활/문화", rss: "https://www.yna.co.kr/rss/culture.xml", category: "문화" },
  { name: "한겨레 - 사회", rss: "https://www.hani.co.kr/rss/society/", category: "사회" },
  { name: "경향신문", rss: "https://www.khan.co.kr/rss/rssdata/total_news.xml", category: "종합" }
];
