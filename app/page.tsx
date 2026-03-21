import Link from "next/link";
import { db } from "@/lib/db";
import PostCard from "@/components/ui/PostCard";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { localizePost } from "@/lib/localize";

export const revalidate = 0;

async function getLatestNews() {
  return db.post.findMany({
    where: { published: true, category: "news" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { comments: true } } },
  });
}

async function getLatestReviews() {
  return db.post.findMany({
    where: { published: true, category: "review" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { comments: true } } },
  });
}

async function getFeaturedPost() {
  const featured = await db.post.findFirst({
    where: { published: true, featured: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });
  if (featured) return featured;
  return db.post.findFirst({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });
}

function SectionHeader({ label, href, viewAll }: { label: string; href: string; viewAll: string }) {
  return (
    <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#ff4e5b]">
      <h2
        className="text-base font-black uppercase tracking-widest text-[#0d0b0a]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {label}
      </h2>
      <Link
        href={href}
        className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#ff4e5b] transition-colors"
      >
        {viewAll}
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [hero, news, reviews, locale] = await Promise.all([
    getFeaturedPost(),
    getLatestNews(),
    getLatestReviews(),
    getLocale(),
  ]);

  const localizedHero = hero ? localizePost(hero, locale) : null;
  const localizedNews = news.map(p => localizePost(p, locale));
  const localizedReviews = reviews.map(p => localizePost(p, locale));
  const isEmpty = !hero && news.length === 0 && reviews.length === 0;

  return (
    <div>
      {/* ── Hero ── */}
      {localizedHero && <PostCard post={localizedHero} variant="hero" />}

      {/* ── Empty state ── */}
      {isEmpty && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
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

      {/* ── Playlist ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="pt-10 border-t border-[#e0ddd8]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] mb-6">
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

      {/* ── News + Reviews ── */}
      {!isEmpty && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* News — left column */}
            <div>
              <SectionHeader label={t(locale, "latestNews")} href="/news" viewAll={t(locale, "viewAll")} />
              {localizedNews.length === 0 ? (
                <p className="text-[#a89e99] text-sm py-8">{t(locale, "noNewsYet")}</p>
              ) : (
                <div className="space-y-0">
                  {localizedNews[0] && (
                    <div className="mb-8">
                      <PostCard post={localizedNews[0]} variant="featured" />
                    </div>
                  )}
                  {localizedNews.slice(1).map((post) => (
                    <PostCard key={post.id} post={post} variant="standard" />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews — right column */}
            <div>
              <SectionHeader label={t(locale, "reviews")} href="/reviews" viewAll={t(locale, "viewAll")} />
              {localizedReviews.length === 0 ? (
                <p className="text-[#a89e99] text-sm py-8">{t(locale, "noReviewsYet")}</p>
              ) : (
                <div className="space-y-0">
                  {localizedReviews[0] && (
                    <div className="mb-8">
                      <PostCard post={localizedReviews[0]} variant="featured" />
                    </div>
                  )}
                  {localizedReviews.slice(1).map((post) => (
                    <PostCard key={post.id} post={post} variant="standard" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Region tags ── */}
          <div className="mt-16 pt-10 border-t border-[#e0ddd8]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] mb-5 text-center">
              {t(locale, "browseByRegion")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Korea", href: "/reviews?country=kr" },
                { label: "Japan", href: "/reviews?country=jp" },
                { label: "Asia", href: "/reviews?country=asia" },
                { label: "UK / US", href: "/reviews?country=en" },
              ].map((tag) => (
                <Link
                  key={tag.href}
                  href={tag.href}
                  className="text-xs font-semibold uppercase tracking-wider text-[#a89e99] border border-[#e0ddd8] px-5 py-2 hover:border-[#ff4e5b] hover:text-[#ff4e5b] transition-colors"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Artist CTA ── */}
          <div className="mt-16">
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
        </div>
      )}
    </div>
  );
}
