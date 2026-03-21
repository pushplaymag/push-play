import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/nav-config";

export const metadata: Metadata = { title: "Sign In" };

const PROVIDERS = [
  {
    id: "github",
    name: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
    bg: "bg-[#24292e] hover:bg-[#333]",
    text: "text-white",
    border: "border-transparent",
  },
];

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/");

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
            Sign in to join the community
          </p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-[#c8922a] mb-8" />

        {/* Providers */}
        <div className="space-y-2.5">
          {PROVIDERS.map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server";
                await signIn(provider.id, { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className={`w-full flex items-center gap-3 px-5 py-3 border text-[11px] tracking-[0.15em] uppercase font-medium transition-colors ${provider.bg} ${provider.text} ${provider.border}`}
              >
                {provider.icon}
                <span>Continue with {provider.name}</span>
              </button>
            </form>
          ))}
        </div>

        <p className="text-[10px] text-[#5a5250] text-center mt-8 tracking-widest uppercase">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
