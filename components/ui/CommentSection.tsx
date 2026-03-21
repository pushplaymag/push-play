"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { enUS, ko, ja } from "date-fns/locale";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const dateFnsLocales = { en: enUS, ko, ja };

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  locale: Locale;
}

export default function CommentSection({ postId, initialComments, locale }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to post comment.");
      }
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    try {
      await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch { /* ignore */ }
  }

  const dfLocale = dateFnsLocales[locale];

  return (
    <section className="mt-16 pt-12 border-t border-[#e0ddd8]">
      <h2 className="text-[11px] tracking-[0.3em] uppercase text-[#ff4e5b] mb-8">
        {t(locale, "comments")}{" "}
        <span className="text-[#e0ddd8]">({comments.length})</span>
      </h2>

      {/* Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex items-start gap-4">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt="profile"
                width={32}
                height={32}
                className="rounded-full flex-shrink-0 mt-1 opacity-80"
              />
            ) : (
              <div className="w-8 h-8 bg-[#eeece8] border border-[#e0ddd8] flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t(locale, "writeComment")}
                rows={3}
                className="w-full bg-[#eeece8] border border-[#e0ddd8] px-4 py-3 text-sm text-[#3a3330] placeholder-[#b8b0ab] focus:outline-none focus:border-[#ff4e5b] resize-none transition-colors"
              />
              {error && <p className="mt-1 text-xs text-red-400/80">{error}</p>}
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="text-[10px] tracking-[0.2em] uppercase bg-[#ff4e5b] text-[#0d0b0a] px-6 py-2 hover:bg-[#e8ac3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? t(locale, "posting") : t(locale, "postComment")}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 border border-[#e0ddd8] p-8 text-center">
          <p className="text-sm text-[#a89e99] mb-4">
            {t(locale, "signInToComment")}
          </p>
          <button
            onClick={() => signIn()}
            className="text-[10px] tracking-[0.2em] uppercase text-[#ff4e5b] border border-[#ff4e5b] px-6 py-2.5 hover:bg-[#ff4e5b] hover:text-white transition-colors"
          >
            {t(locale, "signIn")}
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-8">
        {comments.length === 0 && (
          <p className="text-[#4a4240] text-sm text-center py-10 italic" style={{ fontFamily: "var(--font-display)" }}>
            {t(locale, "beFirst")}
          </p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            {comment.user.image ? (
              <Image
                src={comment.user.image}
                alt="profile"
                width={28}
                height={28}
                className="rounded-full flex-shrink-0 opacity-70"
              />
            ) : (
              <div className="w-7 h-7 bg-[#eeece8] border border-[#e0ddd8] flex-shrink-0" />
            )}
            <div className="flex-1 border-b border-[#e0ddd8] pb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-[#7a706b]">
                  {comment.user.name ?? "Anonymous"}
                </span>
                <span className="text-[10px] text-[#e0ddd8]">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: dfLocale,
                  })}
                </span>
                {session && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-auto text-[9px] tracking-widest uppercase text-[#e0ddd8] hover:text-red-400/70 transition-colors"
                  >
                    {t(locale, "deleteComment")}
                  </button>
                )}
              </div>
              <p className="text-sm text-[#7a706b] leading-relaxed whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
