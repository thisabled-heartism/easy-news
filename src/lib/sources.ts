export type NewsSource = {
  name: string;
  rss: string;
  category?: string;
};

export const NEWS_SOURCES: NewsSource[] = [
  // 사회
  { name: "연합뉴스 - 사회", rss: "https://www.yna.co.kr/rss/society.xml", category: "사회" },
  { name: "한겨레 - 사회", rss: "https://www.hani.co.kr/rss/society/", category: "사회" },

  // 정치
  { name: "연합뉴스 - 정치", rss: "https://www.yna.co.kr/rss/politics.xml", category: "정치" },
  { name: "한겨레 - 정치", rss: "https://www.hani.co.kr/rss/politics/", category: "정치" },

  // 경제 (신규)
  { name: "연합뉴스 - 경제", rss: "https://www.yna.co.kr/rss/economy.xml", category: "경제" },
  { name: "한겨레 - 경제", rss: "https://www.hani.co.kr/rss/economy/", category: "경제" },

  // 문화 (확대)
  { name: "연합뉴스 - 생활/문화", rss: "https://www.yna.co.kr/rss/culture.xml", category: "문화" },
  { name: "한겨레 - 문화", rss: "https://www.hani.co.kr/rss/culture/", category: "문화" },

  // 종합
  { name: "경향신문", rss: "https://www.khan.co.kr/rss/rssdata/total_news.xml", category: "종합" }
];
