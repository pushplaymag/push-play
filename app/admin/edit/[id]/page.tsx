import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-black text-[#0d0b0a] mb-8">Edit Post</h1>
      <PostForm initialData={post} />
    </div>
  );
}
