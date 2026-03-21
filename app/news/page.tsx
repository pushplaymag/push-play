import { db } from "@/lib/db";
import PostCard from "@/components/ui/PostCard";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { localizePost } from "@/lib/localize";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "News" };
export const revalidate = 60;

export default async function NewsPage() {
  const [posts, locale] = await Promise.all([
    db.post.findMany({
      where: { published: true, category: "news" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { comments: true } } },
    }),
    getLocale(),
  ]);

  const localizedPosts = posts.map(p => localizePost(p, locale));
  const hero = localizedPosts[0];
  const rest = localizedPosts.slice(1);

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-[#e0ddd8] py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-2">
              {t(locale, "latest")}
            </p>
            <h1
              className="text-4xl sm:text-5xl font-black text-[#0d0b0a]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t(locale, "news")}
            </h1>
          </div>
          <p className="hidden sm:block text-sm text-[#a89e99] max-w-xs text-right">
            {t(locale, "newsDesc")}
          </p>
        </div>
      </div>

      {/* Hero */}
      {hero && <PostCard post={hero} variant="hero" />}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        {posts.length === 0 && (
          <p
            className="text-center text-[#c8c0bb] py-24 text-xl font-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t(locale, "noNewsPublished")}
          </p>
        )}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <PostCard key={post.id} post={post} variant="featured" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
