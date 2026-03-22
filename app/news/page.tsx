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

  return (
    <div>
      {/* Page header */}
      <div className="border-b-2 border-[#0d0b0a] py-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <h1
            className="text-3xl sm:text-4xl font-black text-[#0d0b0a]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t(locale, "news")}
          </h1>
          <p className="hidden sm:block text-xs text-[#a89e99]">
            Total {posts.length} Posts
          </p>
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
        {posts.length === 0 && (
          <p
            className="text-center text-[#c8c0bb] py-24 text-xl font-black"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t(locale, "noNewsPublished")}
          </p>
        )}
        {localizedPosts.map((post) => (
          <PostCard key={post.id} post={post} variant="list" />
        ))}
      </div>
    </div>
  );
}
