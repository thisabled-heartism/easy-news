import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CATEGORIES } from "@/lib/category";
import "./globals.css";

export const metadata: Metadata = {
  title: "하티즘 뉴스 — 마음으로 읽는 쉬운 소식",
  description: "발달장애인도 이해할 수 있는 쉬운말로 변환된 뉴스 채널",
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#7c3aed"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gradient-to-br from-gray-50 to-purple-50/30 min-h-screen">
        <header className="bg-white border-b-3 border-gray-100 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group no-underline">
              <Logo />
              <div className="leading-tight">
                <div className="font-black text-2xl tracking-tight text-gray-900">하티즘 뉴스</div>
                <div className="text-xs font-medium text-purple-600">마음으로 읽는 쉬운 소식</div>
              </div>
            </Link>
            {/* 데스크톱 네비 (우측) */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 rounded-lg text-sm font-bold text-gray-700 hover:text-purple-700 hover:bg-purple-50">
                전체
              </Link>
              {CATEGORIES.map(cat => (
                <Link
                  key={cat}
                  href={`/?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-2 rounded-lg text-sm font-bold text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>
          {/* 모바일 네비 (가로 스크롤) */}
          <nav className="md:hidden flex overflow-x-auto px-4 pb-3 gap-2 scrollbar-hide">
            <Link
              href="/"
              className="shrink-0 px-4 py-2 rounded-full text-sm font-bold text-gray-700 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 whitespace-nowrap"
            >
              전체
            </Link>
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={`/?category=${encodeURIComponent(cat)}`}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-bold text-gray-700 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>

        <footer className="border-t-3 border-gray-100 bg-white mt-16">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="flex items-center gap-2 mb-4">
              <Logo className="w-6 h-6" />
              <span className="font-black text-lg tracking-tight">하티즘 뉴스</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              하티즘 뉴스는 발달장애인도 이해할 수 있는 쉬운말로 뉴스를 전하는 서비스입니다.
            </p>
            <p className="text-sm text-gray-500">모든 뉴스는 원문 출처와 함께 표시됩니다.</p>
            <p className="text-xs text-gray-400 mt-6">© Heartism News</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
