import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string | null;
    category: string;
    author: string;
    rating?: number | null;
    artist?: string | null;
    album?: string | null;
    genre?: string | null;
    country?: string | null;
    createdAt: Date;
    _count?: { comments: number };
  };
  variant?: "hero" | "featured" | "standard" | "compact" | "review" | "list";
}

const COUNTRY_LABELS: Record<string, string> = {
  kr: "Korea",
  jp: "Japan",
  asia: "Asia",
  en: "UK / US",
  us: "US",
  uk: "UK",
};

function CategoryTag({
  category,
  country,
  genre,
}: {
  category: string;
  country?: string | null;
  genre?: string | null;
}) {
  const parts = [
    category === "news" ? "News" : "Review",
    country ? (COUNTRY_LABELS[country] ?? country) : null,
    genre ?? null,
  ].filter(Boolean);

  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b]">
      {parts.join(" · ")}
    </span>
  );
}

function ScoreTag({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ff4e5b]">
      {rating.toFixed(1)}
      <span className="text-[#a89e99] font-normal">/ 5</span>
    </span>
  );
}

function Meta({ post }: { post: PostCardProps["post"] }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#a89e99]">
      <span>{post.author}</span>
      <span>·</span>
      <span>
        {formatDistanceToNow(new Date(post.createdAt), {
          addSuffix: true,
          locale: enUS,
        })}
      </span>
      {post._count && post._count.comments > 0 && (
        <>
          <span>·</span>
          <span>{post._count.comments} comments</span>
        </>
      )}
    </div>
  );
}

// Hero — full-width image overlay, big condensed title
function HeroCard({ post }: { post: PostCardProps["post"] }) {
  return (
    <Link href={`/${post.category}/${post.slug}`} className="group block">
      <article className="relative overflow-hidden bg-[#eeece8]" style={{ minHeight: 520 }}>
        {post.coverImage && (
          <div className="absolute inset-0">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover opacity-55 group-hover:opacity-65 group-hover:scale-105 transition-all duration-700"
              priority
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-[#111315]/50 to-transparent" />
        <div
          className="relative flex flex-col justify-end px-6 pb-10 pt-40 sm:px-12 sm:pb-14"
          style={{ minHeight: 520 }}
        >
          <div className="mb-3">
            <CategoryTag category={post.category} country={post.country} genre={post.genre} />
          </div>
          {post.artist && (
            <p className="text-sm font-medium text-[#7a706b] mb-1">
              {post.artist}
              {post.album ? ` — ${post.album}` : ""}
            </p>
          )}
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 group-hover:text-[#ff4e5b] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {post.title}
          </h2>
          {post.rating != null && (
            <div className="mb-3">
              <ScoreTag rating={post.rating} />
            </div>
          )}
          <p className="text-sm text-[#7a706b] max-w-2xl line-clamp-2 mb-5">{post.excerpt}</p>
          <Meta post={post} />
        </div>
      </article>
    </Link>
  );
}

// Featured — image top (16:9), text below
function FeaturedCard({ post }: { post: PostCardProps["post"] }) {
  return (
    <Link href={`/${post.category}/${post.slug}`} className="group block h-full">
      <article className="flex flex-col h-full">
        <div className="relative overflow-hidden bg-[#eeece8]" style={{ paddingTop: "56.25%" }}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-[#eeece8]" />
          )}
        </div>
        <div className="flex flex-col flex-1 pt-4">
          <div className="mb-2">
            <CategoryTag category={post.category} country={post.country} genre={post.genre} />
          </div>
          {post.artist && (
            <p className="text-xs text-[#a89e99] mb-1">
              {post.artist}
              {post.album ? ` · ${post.album}` : ""}
            </p>
          )}
          <h3 className="font-bold text-[#0d0b0a] leading-snug mb-2 group-hover:text-[#ff4e5b] transition-colors line-clamp-3 text-base sm:text-lg">
            {post.title}
          </h3>
          {post.rating != null && (
            <div className="mb-2">
              <ScoreTag rating={post.rating} />
            </div>
          )}
          <p className="text-sm text-[#a89e99] line-clamp-2 flex-1 mb-3">{post.excerpt}</p>
          <Meta post={post} />
        </div>
      </article>
    </Link>
  );
}

// Standard — horizontal list row
function StandardCard({ post }: { post: PostCardProps["post"] }) {
  return (
    <Link href={`/${post.category}/${post.slug}`} className="group block">
      <article className="flex gap-4 py-4 border-b border-[#e0ddd8]">
        {post.coverImage ? (
          <div className="relative flex-shrink-0 overflow-hidden bg-[#eeece8]" style={{ width: 90, height: 68 }}>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 bg-[#eeece8]" style={{ width: 90, height: 68 }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <CategoryTag category={post.category} country={post.country} genre={post.genre} />
          </div>
          <h3 className="font-bold text-[#0d0b0a] leading-snug group-hover:text-[#ff4e5b] transition-colors text-sm line-clamp-2 mb-1.5">
            {post.title}
          </h3>
          <Meta post={post} />
        </div>
      </article>
    </Link>
  );
}

// Review — square album art
function ReviewCard({ post }: { post: PostCardProps["post"] }) {
  return (
    <Link href={`/${post.category}/${post.slug}`} className="group block h-full">
      <article className="flex flex-col h-full">
        <div className="relative overflow-hidden bg-[#eeece8]" style={{ paddingTop: "100%" }}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-[#eeece8] flex items-center justify-center">
              <span className="text-[#e0ddd8] text-5xl">♪</span>
            </div>
          )}
          {post.rating != null && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 pb-2">
              <ScoreTag rating={post.rating} />
            </div>
          )}
        </div>
        <div className="pt-3 flex flex-col flex-1">
          {post.artist && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-0.5">
              {post.artist}
            </p>
          )}
          {post.album && (
            <p className="text-xs text-[#7a706b] italic mb-1">{post.album}</p>
          )}
          <h3 className="font-bold text-[#0d0b0a] leading-snug group-hover:text-[#ff4e5b] transition-colors text-sm">
            {post.title}
          </h3>
        </div>
      </article>
    </Link>
  );
}

// List — CINRA-style horizontal list row with large thumbnail
function ListCard({ post }: { post: PostCardProps["post"] }) {
  const dateStr = new Date(post.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "");

  return (
    <Link href={`/${post.category}/${post.slug}`} className="group block">
      <article className="flex gap-5 py-5 border-b border-[#e8e6e2]">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 overflow-hidden bg-[#eeece8]" style={{ width: 180, height: 120 }}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-[#eeece8]" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="mb-1.5">
              <CategoryTag category={post.category} country={post.country} genre={post.genre} />
            </div>
            <h3 className="font-bold text-[#0d0b0a] leading-snug group-hover:text-[#ff4e5b] transition-colors text-base sm:text-lg line-clamp-2 mb-2">
              {post.title}
            </h3>
            <p className="text-sm text-[#a89e99] hidden sm:block" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.5rem" }}>
              {post.excerpt}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-[11px] text-[#a89e99]">
              <span className="font-medium">{post.author}</span>
              <span>·</span>
              <span>{dateStr}</span>
            </div>
            {post._count && post._count.comments > 0 && (
              <span className="text-[11px] text-[#a89e99]">💬 {post._count.comments}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function PostCard({ post, variant = "featured" }: PostCardProps) {
  if (variant === "hero") return <HeroCard post={post} />;
  if (variant === "featured") return <FeaturedCard post={post} />;
  if (variant === "standard") return <StandardCard post={post} />;
  if (variant === "review") return <ReviewCard post={post} />;
  if (variant === "compact") return <StandardCard post={post} />;
  if (variant === "list") return <ListCard post={post} />;
  return <FeaturedCard post={post} />;
}
