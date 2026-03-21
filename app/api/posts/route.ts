import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: NextRequest) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, excerpt, content, titleKo, excerptKo, contentKo, titleJa, excerptJa, contentJa, coverImage, category, tags, published, featured, author, rating, artist, album, genre, country } = body;

  // Allow Korean-only posts: use Ko fields as fallback for English
  const effectiveTitle = title || titleKo;
  const effectiveExcerpt = excerpt || excerptKo;
  const effectiveContent = content || contentKo;

  if (!effectiveTitle || !effectiveExcerpt || !effectiveContent || !category) {
    return NextResponse.json({ error: "Missing required fields (title, excerpt, content)" }, { status: 400 });
  }

  let slug = slugify(effectiveTitle);
  if (!slug) slug = `post-${Date.now()}`;
  const existing = await db.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const post = await db.post.create({
    data: {
      title: effectiveTitle,
      slug,
      excerpt: effectiveExcerpt,
      content: effectiveContent,
      titleKo: titleKo || null,
      excerptKo: excerptKo || null,
      contentKo: contentKo || null,
      titleJa: titleJa || null,
      excerptJa: excerptJa || null,
      contentJa: contentJa || null,
      coverImage: coverImage || null,
      category,
      tags: JSON.stringify(tags || []),
      published: published || false,
      featured: featured || false,
      author: author || "push play",
      rating: rating ? parseFloat(rating) : null,
      artist: artist || null,
      album: album || null,
      genre: genre || null,
      country: country || null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
