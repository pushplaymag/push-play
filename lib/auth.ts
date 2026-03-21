import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const providers = [
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ? [GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      })]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token?.role && session.user) {
        (session.user as typeof session.user & { role: string }).role =
          token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: string }).role ?? "USER";
      }
      // Always refresh role from DB so promotions take effect immediately
      if (token.sub) {
        const dbUser = await db.user.findUnique({ where: { id: token.sub }, select: { role: true } });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
