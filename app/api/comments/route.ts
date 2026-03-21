import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json();
  const { postId, content } = body;

  if (!postId || !content?.trim()) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const comment = await db.comment.create({
    data: {
      content: content.trim(),
      postId,
      userId: session.user.id,
    },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
