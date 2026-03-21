"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/nav-config";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign up failed.");
        return;
      }

      // Auto sign in after registration
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirectTo: "/",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="font-serif text-3xl font-black text-[#1a1614] mb-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {SITE_CONFIG.name}
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#6b635c]">
            Create your account
          </p>
        </div>

        <div className="border-t-2 border-[#c8922a] mb-8" />

        {/* Google Sign In */}
        <form
          action={async () => {
            await signIn("google", { redirectTo: "/" });
          }}
          className="mb-6"
        >
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-5 py-3 border border-[#d4ccc7] text-[11px] tracking-[0.15em] uppercase font-medium bg-white hover:bg-neutral-50 text-neutral-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-[#e0ddd8]" />
          <span className="text-[10px] tracking-widest uppercase text-[#a89e99]">or</span>
          <div className="flex-1 border-t border-[#e0ddd8]" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Name (optional)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-[#d4ccc7] text-sm text-[#1a1614] placeholder-[#a89e99] focus:outline-none focus:border-[#c8922a] bg-white"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 border border-[#d4ccc7] text-sm text-[#1a1614] placeholder-[#a89e99] focus:outline-none focus:border-[#c8922a] bg-white"
          />
          <input
            type="password"
            placeholder="Password (min. 8 characters)"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 border border-[#d4ccc7] text-sm text-[#1a1614] placeholder-[#a89e99] focus:outline-none focus:border-[#c8922a] bg-white"
          />
          <input
            type="password"
            placeholder="Confirm password"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full px-4 py-3 border border-[#d4ccc7] text-sm text-[#1a1614] placeholder-[#a89e99] focus:outline-none focus:border-[#c8922a] bg-white"
          />

          {error && (
            <p className="text-[11px] text-red-500 tracking-wide">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 bg-[#1a1614] hover:bg-[#2a2220] text-white text-[11px] tracking-[0.2em] uppercase font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-[10px] text-[#5a5250] text-center mt-6 tracking-widest uppercase">
          Already have an account?{" "}
          <Link href="/auth/signin" className="underline hover:text-[#1a1614]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
