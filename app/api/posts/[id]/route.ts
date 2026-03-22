import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Explicitly map fields to avoid type mismatches (e.g. tags must be JSON string)
  const data: Record<string, unknown> = {
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    titleKo: body.titleKo ?? null,
    excerptKo: body.excerptKo ?? null,
    contentKo: body.contentKo ?? null,
    titleJa: body.titleJa ?? null,
    excerptJa: body.excerptJa ?? null,
    contentJa: body.contentJa ?? null,
    coverImage: body.coverImage ?? null,
    category: body.category,
    author: body.author,
    published: body.published ?? false,
    featured: body.featured ?? false,
    rating: body.rating ? parseFloat(body.rating) : null,
    artist: body.artist ?? null,
    album: body.album ?? null,
    genre: body.genre ?? null,
    country: body.country ?? null,
    tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : (body.tags ?? "[]"),
  };

  const post = await db.post.update({ where: { id }, data });
  return NextResponse.json(post);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
