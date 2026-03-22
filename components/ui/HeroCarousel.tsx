"use client";
import { useState, useEffect } from "react";
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

export default function HeroCarousel({ posts }: { posts: CarouselPost[] }) {
  const [current, setCurrent] = useState(0);

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
  const post = posts[current];

  return (
    <div className="relative overflow-hidden bg-[#111315]" style={{ minHeight: 540 }}>
      {/* Background images with fade transition */}
      {posts.map((p, i) => (
        <div
          key={p.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          {p.coverImage && (
            <Image
              src={p.coverImage}
              alt={p.title}
              fill
              className="object-cover opacity-55"
              priority={i === 0}
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-[#111315]/50 to-transparent" />

      {/* Content */}
      <Link
        href={`/${post.category}/${post.slug}`}
        className="group relative block"
        style={{ minHeight: 540 }}
      >
        <div
          className="relative flex flex-col justify-end px-6 sm:px-14 pb-16 pt-20"
          style={{ minHeight: 540 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-3">
            {post.category === "news" ? "News" : "Review"}
          </span>
          <h2
            className="text-3xl sm:text-5xl font-black text-white leading-tight mb-3 group-hover:text-[#ff4e5b] transition-colors max-w-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {post.title}
          </h2>
          <p className="text-sm text-[#9a9090] max-w-2xl line-clamp-2 hidden sm:block">
            {post.excerpt}
          </p>
        </div>
      </Link>

      {/* Prev / Next */}
      {posts.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white text-xl flex items-center justify-center transition-colors z-10"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white text-xl flex items-center justify-center transition-colors z-10"
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {posts.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
