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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 py-12">
      {/* Back */}
      <Link
        href="/reviews"
        className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#7a706b] transition-colors mb-10 inline-block"
      >
        ← Reviews
      </Link>

      {/* Album art */}
      {post.coverImage && (
        <div className="relative w-48 h-48 mx-auto mb-10 shadow-2xl">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
        </div>
      )}

      {/* Header */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b]">Review</span>
          {post.country && (
            <>
              <span className="text-[#e0ddd8]">·</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99]">
                {COUNTRY_LABELS[post.country] ?? post.country}
              </span>
            </>
          )}
          {post.genre && (
            <>
              <span className="text-[#e0ddd8]">·</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99]">{post.genre}</span>
            </>
          )}
        </div>

        {post.artist && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a706b] mb-2">{post.artist}</p>
        )}
        {post.album && (
          <p className="text-xl italic text-[#7a706b] mb-3">{post.album}</p>
        )}

        <h1
          className="text-3xl sm:text-4xl font-black text-[#0d0b0a] leading-tight mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {lPost.title}
        </h1>

        {/* Star rating */}
        {post.rating != null && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-3xl font-black text-[#ff4e5b]">{post.rating.toFixed(1)}</span>
            <span className="text-[#a89e99]">/ 5</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-b border-[#e0ddd8] py-3">
          <div className="flex items-center justify-center sm:justify-start gap-4 text-[10px] font-bold uppercase tracking-widest text-[#a89e99]">
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
      </header>

      {/* Body */}
      <ContentRenderer content={lPost.content} />

      <CommentSection postId={post.id} initialComments={post.comments} locale={locale} />
    </div>
  );
}
