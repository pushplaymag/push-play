"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface CarouselPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  category: string;
  author: string;
  createdAt: Date;
}

function truncate(str: string, max: number) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function HeroCarousel({ posts }: { posts: CarouselPost[] }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % posts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [posts.length]);

  if (!posts.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + posts.length) % posts.length);
  const next = () => setCurrent((c) => (c + 1) % posts.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
    touchStartX.current = null;
  };
  const post = posts[current];
  const dateStr = new Date(post.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "");

  return (
    <>
      {/* ── Mobile: full-width overlay ── */}
      <div
        className="sm:hidden relative overflow-hidden bg-[#111315]"
        style={{ minHeight: 440 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {posts.map((p, i) => (
          <div key={p.id} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}>
            {p.coverImage && (
              <Image src={p.coverImage} alt={p.title} fill className="object-cover opacity-55" priority={i === 0} />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-[#111315]/50 to-transparent" />
        <Link href={`/${post.category}/${post.slug}`} className="group relative flex flex-col justify-end px-5 pb-14 pt-20" style={{ minHeight: 440 }}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-2">
            {post.category === "news" ? "News" : "Review"}
          </span>
          <h2 className="text-2xl font-black text-white leading-tight mb-2 group-hover:text-[#ff4e5b] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
            {truncate(post.title, 60)}
          </h2>
        </Link>
        {posts.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/60 text-white text-xl flex items-center justify-center z-10">‹</button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 hover:bg-black/60 text-white text-xl flex items-center justify-center z-10">›</button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {posts.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── PC: split layout (image left, text right) ── */}
      <div className="hidden sm:block border-b border-[#e0ddd8] bg-[#f8f7f5] py-10 px-4 lg:px-10">
      <div className="max-w-5xl mx-auto flex" style={{ height: 420 }}>
        {/* Image */}
        <div className="relative w-1/2 bg-[#111315] overflow-hidden flex-shrink-0">
          {posts.map((p, i) => (
            <div key={p.id} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}>
              {p.coverImage ? (
                <Image src={p.coverImage} alt={p.title} fill className="object-cover" priority={i === 0} />
              ) : (
                <div className="absolute inset-0 bg-[#1a1614]" />
              )}
            </div>
          ))}
          {/* Prev/Next */}
          {posts.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white text-2xl flex items-center justify-center z-10">‹</button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white text-2xl flex items-center justify-center z-10">›</button>
            </>
          )}
        </div>

        {/* Text panel */}
        <div className="flex-1 flex flex-col justify-between px-10 py-10 bg-white overflow-hidden">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-4 block">
              {post.category === "news" ? "News" : "Review"}
            </span>
            <Link href={`/${post.category}/${post.slug}`} className="group">
              <h2
                className="text-2xl lg:text-3xl font-black text-[#0d0b0a] leading-tight mb-4 group-hover:text-[#ff4e5b] transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {truncate(post.title, 80)}
              </h2>
            </Link>
            <p className="text-sm text-[#7a706b] leading-relaxed">
              {truncate(post.excerpt, 120)}
            </p>
          </div>

          <div className="space-y-4">
            {/* Dots */}
            {posts.length > 1 && (
              <div className="flex gap-2">
                {posts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-2 bg-[#0d0b0a]" : "w-2 h-2 bg-[#d4ccc7]"}`}
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 text-[11px] text-[#a89e99]">
              <span>{post.author}</span>
              <span>·</span>
              <span>{dateStr}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
