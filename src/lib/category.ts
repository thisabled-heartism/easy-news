type CatStyle = {
  bg: string;
  text: string;
  emoji: string;
  gradFrom: string;
  gradTo: string;
};

const STYLES: Record<string, CatStyle> = {
  "사회":   { bg: "bg-purple-100", text: "text-purple-700", emoji: "🏛️", gradFrom: "from-purple-100", gradTo: "to-purple-50" },
  "정치":   { bg: "bg-blue-100",   text: "text-blue-700",   emoji: "🗳️", gradFrom: "from-blue-100",   gradTo: "to-blue-50" },
  "경제":   { bg: "bg-emerald-100",text: "text-emerald-700",emoji: "💰", gradFrom: "from-emerald-100",gradTo: "to-emerald-50" },
  "문화":   { bg: "bg-pink-100",   text: "text-pink-700",   emoji: "🎭", gradFrom: "from-pink-100",   gradTo: "to-pink-50" },
  "날씨":   { bg: "bg-amber-100",  text: "text-amber-700",  emoji: "🌤️", gradFrom: "from-amber-100",  gradTo: "to-amber-50" },
  "스포츠": { bg: "bg-orange-100", text: "text-orange-700", emoji: "⚽", gradFrom: "from-orange-100", gradTo: "to-orange-50" },
  "국제":   { bg: "bg-cyan-100",   text: "text-cyan-700",   emoji: "🌏", gradFrom: "from-cyan-100",   gradTo: "to-cyan-50" },
  "종합":   { bg: "bg-gray-100",   text: "text-gray-700",   emoji: "📰", gradFrom: "from-gray-100",   gradTo: "to-gray-50" }
};

const DEFAULT: CatStyle = { bg: "bg-gray-100", text: "text-gray-700", emoji: "📰", gradFrom: "from-gray-100", gradTo: "to-gray-50" };

export function catStyle(category: string | null): CatStyle {
  if (!category) return DEFAULT;
  return STYLES[category] ?? DEFAULT;
}

export const CATEGORIES = ["사회", "정치", "경제", "문화", "날씨"];
