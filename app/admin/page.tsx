import { db } from "@/lib/db";
import Link from "next/link";
import AdminPostList from "@/components/admin/AdminPostList";

export const revalidate = 0;

export default async function AdminPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-black text-[#0d0b0a]">Posts</h1>
        <Link
          href="/admin/new"
          className="text-xs font-black uppercase tracking-widest bg-[#ff4e5b] text-white px-5 py-3 hover:bg-[#e03040] transition-colors text-center touch-manipulation"
        >
          + New Post
        </Link>
      </div>
      <AdminPostList posts={posts} />
    </div>
  );
}
