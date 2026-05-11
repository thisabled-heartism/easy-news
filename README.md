# 쉬운 뉴스 (Easy News)

발달장애인도 이해할 수 있는 쉬운말로 변환된 온라인 뉴스 채널.

## 동작 원리

1. **수집**: 한국 주요 언론사 RSS에서 기사 가져오기 (`src/lib/crawler.ts`)
2. **변환**: Claude API로 쉬운말 가이드라인에 맞춰 변환 (`src/lib/claude.ts`)
3. **게시**: Next.js로 큰 글씨, 단순한 레이아웃의 웹페이지 제공
4. **자동화**: Vercel Cron이 3시간마다 자동 실행 (`vercel.json`)

## 처음 설정하기 (Windows)

```powershell
# 1. 의존성 설치
cd C:\Users\jiyeon\Desktop\easy-news
npm install

# 2. 환경변수 설정
copy .env.example .env
# .env 파일 열어서 ANTHROPIC_API_KEY 채우기

# 3. DB 생성 (SQLite)
npx prisma generate
npx prisma db push

# 4. 첫 크롤링 (수동 테스트)
npm run crawl

# 5. 개발 서버 실행
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

## 주요 명령어

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 실행 |
| `npm run crawl` | 수동으로 크롤링 + 쉬운말 변환 1회 실행 |
| `npm run db:studio` | DB GUI로 보기 |

## 배포 (Vercel)

```powershell
# Vercel CLI 설치 (한 번만)
npm i -g vercel

# 배포
vercel
```

배포 후 Vercel 대시보드에서 환경변수 설정:
- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL` (선택, 기본 Haiku 4.5)
- `DATABASE_URL` (운영은 PostgreSQL 권장 → Vercel Postgres / Neon / Supabase)
- `CRON_SECRET`

`vercel.json`에 정의된 Cron이 자동으로 3시간마다 `/api/cron/crawl` 호출.

## 운영 시 권장사항

### DB 전환 (SQLite → PostgreSQL)
운영 환경에서는 SQLite 대신 PostgreSQL 권장:
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
무료 옵션: Neon, Supabase, Vercel Postgres

### 비용 관리
- 기본 모델은 **Claude Haiku 4.5** ($1/$5 per MTok)
- 하루 50건 변환 시 약 $9/월
- 프롬프트 캐싱 적용됨 (시스템 프롬프트 자동 캐시 → 입력 비용 90% 절감)

### 뉴스 소스 추가/변경
`src/lib/sources.ts`에서 RSS URL 추가/제거 가능.

### 저작권
- 본 서비스는 RSS 요약본을 쉬운말로 변환하고 **반드시 원문 링크를 함께 표시**
- 전체 본문 복제는 하지 않음
- 운영 시 각 언론사의 RSS 이용 약관 재확인 권장

## 폴더 구조

```
easy-news/
├── prisma/
│   └── schema.prisma        # DB 스키마
├── scripts/
│   └── crawl.ts             # 수동 크롤링 스크립트
├── src/
│   ├── app/
│   │   ├── layout.tsx       # 공통 레이아웃 (헤더/푸터)
│   │   ├── page.tsx         # 홈 (뉴스 목록)
│   │   ├── news/[id]/       # 뉴스 상세 페이지
│   │   ├── api/cron/crawl/  # 자동 크롤링 엔드포인트
│   │   └── globals.css
│   └── lib/
│       ├── db.ts            # Prisma 클라이언트
│       ├── sources.ts       # 뉴스 RSS 목록
│       ├── crawler.ts       # 크롤러
│       └── claude.ts        # 쉬운말 변환
├── .env.example
├── package.json
├── tailwind.config.ts
├── next.config.js
└── vercel.json              # Cron 설정
```

## 다음 단계 (TODO)

- [ ] 음성 읽어주기 (TTS) 버튼 추가
- [ ] 카테고리별 필터링 페이지
- [ ] 그림/아이콘으로 카테고리 표시
- [ ] 사용자 피드백 수집 (이해하기 어려운지 표시)
- [ ] 검색 기능
- [ ] PWA로 모바일 앱처럼 설치 가능하게
