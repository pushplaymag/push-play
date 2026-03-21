import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Auto-promote first user if no admins exist yet
  const adminCount = await db.user.count({ where: { role: "ADMIN" } });
  if (adminCount === 0) {
    await db.user.update({ where: { id: session.user.id }, data: { role: "ADMIN" } });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any).role;
    if (role !== "ADMIN") {
      redirect("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="bg-white border-b border-[#e0ddd8] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-[#0d0b0a]">
            Admin
          </Link>
          <Link href="/admin/new" className="text-xs font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#ff4e5b] transition-colors">
            + New Post
          </Link>
        </div>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#0d0b0a] transition-colors">
          ← Site
        </Link>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {children}
      </div>
    </div>
  );
}
