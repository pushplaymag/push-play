"use client";

import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f5] px-6">
      <div className="w-full max-w-xs">
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl font-black text-[#1a1614] mb-1 tracking-tight">
            Admin
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b635c]">
            Push Play
          </p>
        </div>

        <div className="border-t-2 border-[#1a1614] mb-8" />

        <button
          onClick={() => signIn("github", { callbackUrl: "/admin" })}
          className="w-full flex items-center gap-3 px-5 py-3 border border-transparent text-[11px] tracking-[0.15em] uppercase font-medium bg-[#24292e] hover:bg-[#333] text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span>Continue with GitHub</span>
        </button>
      </div>
    </div>
  );
}
