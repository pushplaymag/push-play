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
import type { Metadata } from "next";

const dateFnsLocales = { en: enUS, ko, ja };

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({ where: { slug, category: "news" } });
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const post = await db.post.findUnique({
    where: { slug, category: "news", published: true },
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
      {/* Cover */}
      {post.coverImage && (
        <div className="max-w-2xl mx-auto px-6 lg:px-0 pt-10">
          <div className="relative w-full overflow-hidden bg-[#eeece8]" style={{ height: 400 }}>
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 lg:px-0 py-12">
        {/* Back */}
        <Link
          href="/news"
          className="text-[10px] tracking-[0.25em] uppercase text-[#6b635c] hover:text-[#9a8e86] transition-colors mb-8 inline-block"
        >
          ← News
        </Link>

        {/* Header */}
        <header className="mb-10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#c8922a] mb-4">News</p>
          <h1
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1614] leading-tight mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {lPost.title}
          </h1>
          <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase text-[#6b635c] border-t border-b border-[#e8e5e1] py-3">
            <span>{post.author}</span>
            <span className="text-[#d4ccc7]">·</span>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: dateFnsLocales[locale] })}
            </span>
            <span className="text-[#d4ccc7]">·</span>
            <span>{post.comments.length} comments</span>
          </div>
        </header>

        {/* Body */}
        <ContentRenderer content={lPost.content} />

        <CommentSection postId={post.id} initialComments={post.comments} locale={locale} />
      </div>
    </div>
  );
}
