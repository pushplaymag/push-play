"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminPostList({ posts }: { posts: any[] }) {
  const router = useRouter();

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    router.refresh();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const news = posts.filter((p: any) => p.category === "news");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = posts.filter((p: any) => p.category === "review");

  return (
    <div className="space-y-10">
      <Section title="News" posts={news} onToggle={togglePublish} onDelete={deletePost} />
      <Section title="Reviews" posts={reviews} onToggle={togglePublish} onDelete={deletePost} />
    </div>
  );
}

function Section({
  title,
  posts,
  onToggle,
  onDelete,
}: {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  posts: any[];
  onToggle: (id: string, published: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99] mb-4 pb-2 border-b border-[#e0ddd8]">
        {title}
      </h2>
      {posts.length === 0 ? (
        <p className="text-sm text-[#a89e99] py-4">No {title.toLowerCase()} yet.</p>
      ) : (
        <div className="divide-y divide-[#e0ddd8] bg-white border border-[#e0ddd8]">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {posts.map((post: any) => (
            <div key={post.id} className="px-4 py-3 space-y-2">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0d0b0a] break-words leading-snug">{post.title}</p>
                  <p className="text-[10px] text-[#a89e99] mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")} · {post._count.comments} comments
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
                    post.published ? "bg-green-100 text-green-700" : "bg-[#f0f0f0] text-[#a89e99]"
                  }`}
                >
                  {post.published ? "Live" : "Draft"}
                </span>
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onToggle(post.id, post.published)}
                  className="text-[10px] font-bold uppercase tracking-widest border border-[#e0ddd8] px-3 py-1.5 hover:border-[#ff4e5b] hover:text-[#ff4e5b] active:bg-[#fff0f1] transition-colors touch-manipulation"
                >
                  {post.published ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/admin/edit/${post.id}`}
                  className="text-[10px] font-bold uppercase tracking-widest border border-[#e0ddd8] px-3 py-1.5 hover:border-[#0d0b0a] active:bg-[#f8f7f5] transition-colors touch-manipulation"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(post.id)}
                  className="text-[10px] font-bold text-[#a89e99] hover:text-red-500 active:text-red-600 px-2 py-1.5 transition-colors touch-manipulation"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
