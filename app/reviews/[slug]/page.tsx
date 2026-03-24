import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CommentSection from "@/components/ui/CommentSection";
import ContentRenderer from "@/components/ui/ContentRenderer";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { enUS, ko, ja } from "date-fns/locale";
import { getLocale } from "@/lib/locale";
import { localizePost } from "@/lib/localize";
import ShareButtons from "@/components/ui/ShareButtons";
import type { Metadata } from "next";

const dateFnsLocales = { en: enUS, ko, ja };

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug, category: "review" } });
  if (!post) return {};

  const url = `https://www.pushplaymag.net/reviews/${post.slug}`;
  const images = post.coverImage ? [{ url: post.coverImage, width: 1200, height: 800, alt: post.title }] : [];
  const description = [post.artist, post.album, post.excerpt].filter(Boolean).join(" — ");

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description: description || undefined,
      url,
      siteName: "push play",
      type: "article",
      images,
      publishedTime: post.createdAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description || undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

const COUNTRY_LABELS: Record<string, string> = {
  kr: "Korea", jp: "Japan", asia: "Asia", en: "UK / US",
};

export default async function ReviewArticlePage({ params }: PageProps) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const post = await db.post.findUnique({
    where: { slug, category: "review", published: true },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      },
    },
  });
  if (!post) notFound();
  const lPost = localizePost(post, locale);

  return (
    <div>
      {/* ── Split Hero ── */}
      <div className="flex flex-col sm:flex-row">
        {/* Left: Cover Image
            padding-top trick: makes this panel square (100% of its own width),
            capped at 560px. Works on both mobile and desktop without flex conflicts. */}
        <div className="w-full sm:w-1/2 bg-[#0d0b0a]">
          <div className="relative w-full" style={{ paddingTop: "min(100%, 560px)" }}>
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.album ?? post.title}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/30 text-7xl">♪</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div
          className="w-full sm:w-1/2 flex flex-col justify-center px-8 sm:px-12 py-10 sm:py-14 gap-5"
          style={{ background: "#0d0b0a" }}
        >
          {/* Back link */}
          <Link
            href="/reviews"
            className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#ff4e5b] transition-colors self-start"
          >
            ← Reviews
          </Link>

          {/* REVIEW badge */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b]">
            Review
            {post.country && (
              <> · <span className="text-[#a89e99]">{COUNTRY_LABELS[post.country] ?? post.country}</span></>
            )}
          </span>

          {/* Artist + Album */}
          <div>
            {post.artist && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#a89e99] mb-1.5">
                {post.artist}
              </p>
            )}
            {post.album && (
              <p className="text-2xl sm:text-3xl italic text-white leading-snug">
                {post.album}
              </p>
            )}
            {post.genre && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a706b] mt-2">
                {post.genre}
              </p>
            )}
          </div>

          {/* Year / Label */}
          {(post.releaseYear || post.label) && (
            <p className="text-[11px] text-[#7a706b]">
              {[post.releaseYear, post.label].filter(Boolean).join(" / ")}
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Rating */}
          {post.rating != null && (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#ff4e5b]">{post.rating.toFixed(1)}</span>
              <span className="text-[#7a706b] text-sm">/ 5</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 py-12">
        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl font-black text-[#0d0b0a] leading-tight mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {lPost.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-b border-[#e0ddd8] py-3 mb-10">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#a89e99]">
            <span>{post.author}</span>
            <span className="text-[#e0ddd8]">·</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: dateFnsLocales[locale] })}
            </span>
            <span className="text-[#e0ddd8]">·</span>
            <span>{post.comments.length} comments</span>
          </div>
          <ShareButtons url={`https://www.pushplaymag.net/reviews/${post.slug}`} title={lPost.title} />
        </div>

        {/* Content */}
        <ContentRenderer content={lPost.content} />

        <CommentSection postId={post.id} initialComments={post.comments} locale={locale} />
      </div>
    </div>
  );
}
