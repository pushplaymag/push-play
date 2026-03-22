import Link from "next/link";
import { db } from "@/lib/db";
import PostCard from "@/components/ui/PostCard";
import HeroCarousel from "@/components/ui/HeroCarousel";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { localizePost } from "@/lib/localize";

export const revalidate = 0;

async function getCarouselPosts() {
  return db.post.findMany({
    where: { published: true, category: "news" },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { _count: { select: { comments: true } } },
  });
}

async function getLatestNews() {
  return db.post.findMany({
    where: { published: true, category: "news" },
    orderBy: { createdAt: "desc" },
    skip: 3,
    take: 4,
    include: { _count: { select: { comments: true } } },
  });
}

async function getLatestReviews() {
  return db.post.findMany({
    where: { published: true, category: "review" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { _count: { select: { comments: true } } },
  });
}

export default async function HomePage() {
  const [carouselPosts, news, reviews, locale] = await Promise.all([
    getCarouselPosts(),
    getLatestNews(),
    getLatestReviews(),
    getLocale(),
  ]);

  const localizedCarousel = carouselPosts.map((p) => localizePost(p, locale));
  const localizedNews = news.map((p) => localizePost(p, locale));
  const localizedReviews = reviews.map((p) => localizePost(p, locale));
  const isEmpty = carouselPosts.length === 0 && news.length === 0 && reviews.length === 0;

  return (
    <div>
      {/* 1. Hero Carousel — top 3 news */}
      {localizedCarousel.length > 0 && <HeroCarousel posts={localizedCarousel} />}

      {/* Empty state */}
      {isEmpty && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-6">
            {t(locale, "comingSoon")}
          </p>
          <h2
            className="text-5xl sm:text-6xl font-black text-[#d4ccc7] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t(locale, "storiesOnWay")}
          </h2>
        </div>
      )}

      {/* 2. Latest News — 2-column list */}
      {localizedNews.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#0d0b0a]">
            <h2
              className="text-lg font-black text-[#0d0b0a]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t(locale, "latestNews")}
            </h2>
            <Link
              href="/news"
              className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#ff4e5b] transition-colors"
            >
              {t(locale, "viewAll")} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
            {localizedNews.map((post) => (
              <PostCard key={post.id} post={post} variant="list" />
            ))}
          </div>
        </div>
      )}

      {/* 3. Reviews — "편집부 선택" style */}
      {localizedReviews.length > 0 && (
        <div className="bg-[#f4f3f0] py-12 mt-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
            <div className="mb-8 pb-3 border-b border-[#d4cfc9]">
              <div className="flex items-end justify-between">
                <div>
                  <h2
                    className="text-xl font-black text-[#0d0b0a]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {t(locale, "reviews")}
                  </h2>
                  <p className="text-xs text-[#a89e99] mt-0.5">push play이 선택한 리뷰</p>
                </div>
                <Link
                  href="/reviews"
                  className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#ff4e5b] transition-colors"
                >
                  {t(locale, "viewAll")} →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {localizedReviews.map((post) => (
                <PostCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Artist CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="bg-[#eeece8] px-8 py-10 sm:px-14 sm:py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-3">
              {t(locale, "forArtists")}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-black text-[#0d0b0a] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t(locale, "letUsHear")}
            </h2>
            <p className="text-sm text-[#a89e99] max-w-md leading-relaxed">
              {t(locale, "artistsCTA")}
            </p>
          </div>
          <Link
            href="/demo"
            className="flex-shrink-0 text-xs font-black uppercase tracking-widest bg-[#ff4e5b] text-white px-8 py-4 hover:bg-[#e03040] transition-colors"
          >
            {t(locale, "submitDemo")}
          </Link>
        </div>
      </div>

      {/* 5. Playlist — just above footer */}
      <div className="border-t border-[#e0ddd8] py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] mb-5">
            {t(locale, "playlist")}
          </p>
          <iframe
            style={{ borderRadius: "4px" }}
            src="https://open.spotify.com/embed/playlist/43eFC1XtnTmOs52h3WPBRp?utm_source=generator"
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
