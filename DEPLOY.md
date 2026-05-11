# 🚀 인터넷에 배포하기 (Vercel)

이 가이드대로 따라 하시면 **30분~1시간** 안에 인터넷에 사이트가 올라갑니다.
누구나 `https://your-name.vercel.app` 같은 주소로 접속할 수 있어요.

## 📋 준비물 (모두 무료)

1. **GitHub 계정** — 코드 저장소 (https://github.com)
2. **Vercel 계정** — 호스팅 (https://vercel.com) — GitHub 계정으로 바로 가입 가능
3. **Neon 계정** — DB 호스팅 (https://neon.tech) — 운영용 PostgreSQL 무료
4. **Anthropic API 키** — 이미 있음 ✓

---

## 🗂 단계 1: 데이터베이스를 PostgreSQL로 변경

지금은 SQLite(로컬 파일)로 작동하지만, Vercel은 파일 저장 안 됩니다.
무료 PostgreSQL인 **Neon**으로 바꿔야 해요.

### 1-1. Neon 가입 + DB 생성
1. https://neon.tech 접속 → **Sign up** (GitHub로 가입 가능)
2. **Create a project** 클릭
3. 프로젝트 이름: `easy-news` 입력
4. Region: `Asia Pacific - Singapore` (한국에서 가장 빠름) 선택
5. **Create project** 클릭
6. 화면에 뜨는 **Connection string** 복사 (`postgresql://...` 형태) — 메모장에 잠깐 보관

### 1-2. 코드 수정 (Prisma 스키마)
`prisma/schema.prisma` 파일 메모장으로 열어서:

```prisma
datasource db {
  provider = "sqlite"           ← 이걸
  url      = env("DATABASE_URL")
}
```

→ 다음과 같이 변경:
```prisma
datasource db {
  provider = "postgresql"       ← 이렇게
  url      = env("DATABASE_URL")
}
```

저장하고 닫기.

---

## 📦 단계 2: 코드를 GitHub에 올리기

### 2-1. GitHub 저장소 만들기
1. https://github.com → 우측 상단 **+** → **New repository**
2. Repository name: `easy-news`
3. **Private** 선택 (소스 비공개 권장)
4. **Create repository** 클릭

### 2-2. 로컬 코드 푸시 (PowerShell에서)
새 PowerShell 창 열고:
```powershell
cd C:\Users\jiyeon\Desktop\easy-news

git init
git add .
git commit -m "초기 커밋"
git branch -M main
git remote add origin https://github.com/[GitHub_사용자명]/easy-news.git
git push -u origin main
```

> Git 처음 쓰시면 사용자 이름/이메일 등록 필요:
> ```powershell
> git config --global user.name "내이름"
> git config --global user.email "내이메일@example.com"
> ```

---

## ☁️ 단계 3: Vercel에 배포

### 3-1. Vercel 가입 + 프로젝트 생성
1. https://vercel.com → **Sign up** (GitHub로 가입)
2. 대시보드에서 **Add New** → **Project**
3. GitHub에서 `easy-news` 저장소 찾아서 **Import**
4. Framework Preset: **Next.js** 자동 감지됨

### 3-2. 환경 변수 설정 (중요!)
**Environment Variables** 섹션 펼쳐서 다음 4개 입력:

| 이름 | 값 |
|---|---|
| `DATABASE_URL` | Neon에서 복사한 `postgresql://...` 주소 |
| `ANTHROPIC_API_KEY` | 본인 Claude API 키 (`sk-ant-...`) |
| `CLAUDE_MODEL` | `claude-haiku-4-5-20251001` |
| `CRON_SECRET` | 아무 랜덤 문자열 (예: `my-secret-2026-xyz`) |

### 3-3. 배포 시작
**Deploy** 클릭 → 약 2~3분 기다리기

배포 완료되면 `https://easy-news-XXXX.vercel.app` 같은 주소가 나옴.

---

## 🗄 단계 4: 운영 DB 초기화

배포는 됐지만 DB는 비어있는 상태. 첫 데이터 채우기:

### 4-1. 운영 DB에 스키마 만들기
PowerShell에서 (Neon URL 사용):
```powershell
cd C:\Users\jiyeon\Desktop\easy-news

# .env.production 파일 만들기 (운영 DB 주소로)
echo 'DATABASE_URL="여기에_Neon_URL_붙여넣기"' > .env.production
echo 'ANTHROPIC_API_KEY="sk-ant-..."' >> .env.production

# 운영 DB에 스키마 적용
npx prisma db push --schema=prisma/schema.prisma
```

### 4-2. 첫 크롤링 (옵션)
바로 데이터 채우고 싶으면:
```powershell
npx tsx scripts/crawl.ts
```

또는 그냥 기다리면 **3시간 안에 Vercel Cron이 자동 실행**됩니다.

---

## ⏰ 자동 크롤링 확인

배포 후 Vercel 대시보드에서:
1. 프로젝트 → **Settings** → **Cron Jobs** 메뉴
2. `/api/cron/crawl` 작업이 등록돼 있는지 확인 (3시간마다)
3. 첫 실행 후 **Logs** 탭에서 결과 확인 가능

---

## 🎉 완료! 다음 단계

### 도메인 연결 (선택)
`easy-news.vercel.app` 대신 `하티즘뉴스.com` 같은 본인 도메인 쓰고 싶으면:
1. 도메인 구입 (가비아/카페24 등, 연 1~2만원)
2. Vercel **Settings** → **Domains** → 도메인 입력
3. 도메인 사이트에서 안내된 DNS 설정

### 코드 업데이트
나중에 디자인이나 기능 바꿀 때:
```powershell
cd C:\Users\jiyeon\Desktop\easy-news
git add .
git commit -m "디자인 수정"
git push
```
→ Vercel이 자동으로 재배포 (1~2분)

---

## 💸 운영 비용 (월간)

| 항목 | 비용 |
|---|---|
| Vercel Hobby 플랜 | **무료** (cron 포함, 월 100GB 트래픽) |
| Neon Free 플랜 | **무료** (월 0.5GB 저장, 충분) |
| Claude Haiku 4.5 API | 약 $9~17 (1.2~2만원, 변환 건수에 따라) |
| **총합** | **월 1.2만~2만원** |

---

## ⚠️ 자주 만나는 문제

### "Build failed" 에러
- 로컬에서 `npm run build` 먼저 실행해서 에러 없는지 확인
- 환경변수 누락이 가장 흔한 원인

### "Database connection failed"
- Neon URL이 정확한지 확인 (`?sslmode=require` 부분까지 포함)
- Neon 콘솔에서 DB가 활성 상태인지 확인 (장기 미사용 시 sleep)

### Cron이 안 돈다
- Vercel **Settings** → **Cron Jobs**에 작업 등록됐는지 확인
- 무료 플랜은 하루 2회까지만 실행 (3시간마다 = 8회)
- 4번 안 도는 게 정상 → 6시간 간격으로 변경하려면 `vercel.json`의 `0 */6 * * *`로 수정

### 도움이 필요할 때
- Vercel 로그: 대시보드 → 프로젝트 → **Logs** 탭
- Claude API 사용량: https://console.anthropic.com → Usage 탭
