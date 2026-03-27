import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/admin");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      <div className="bg-white border-b border-[#e0ddd8] px-4 sm:px-6 py-0 flex items-center justify-between h-12 sm:h-14">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-[#0d0b0a] py-3 touch-manipulation">
            Admin
          </Link>
          <Link href="/admin/new" className="text-xs font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#ff4e5b] transition-colors py-3 touch-manipulation">
            + New Post
          </Link>
        </div>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#0d0b0a] transition-colors py-3 touch-manipulation">
          ← Site
        </Link>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
