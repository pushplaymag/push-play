import { db } from "@/lib/db";
import PostCard from "@/components/ui/PostCard";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { localizePost } from "@/lib/localize";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reviews" };
export const revalidate = 60;

const FILTERS = [
  { value: "", labelKey: "allFilter" as const },
  { value: "kr", label: "Korea" },
  { value: "jp", label: "Japan" },
  { value: "asia", label: "Asia" },
  { value: "en", label: "UK / US" },
];

interface PageProps {
  searchParams: Promise<{ country?: string }>;
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const [{ country }, locale] = await Promise.all([searchParams, getLocale()]);

  const posts = await db.post.findMany({
    where: {
      published: true,
      category: "review",
      ...(country ? { country } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-[#e0ddd8] py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-2">
              {t(locale, "musicReviews")}
            </p>
            <h1
              className="text-4xl sm:text-5xl font-black text-[#0d0b0a]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Reviews
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-[#a89e99] max-w-xs text-right">
            {t(locale, "reviewsDesc")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-[#e0ddd8] px-4 sm:px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto flex items-center gap-0 overflow-x-auto">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/reviews?country=${f.value}` : "/reviews"}
              className={`flex-shrink-0 text-xs font-bold uppercase tracking-widest px-5 py-4 border-b-2 transition-colors ${
                (country ?? "") === f.value
                  ? "border-[#ff4e5b] text-[#ff4e5b]"
                  : "border-transparent text-[#a89e99] hover:text-[#7a706b]"
              }`}
            >
              {f.labelKey ? t(locale, f.labelKey) : f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        {posts.length === 0 ? (
          <p
            className="text-center text-[#c8c0bb] py-24 text-xl font-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t(locale, "noReviewsFilter")}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={localizePost(post, locale)} variant="review" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
