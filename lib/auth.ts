import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import DiscordProvider from "next-auth/providers/discord";
import SpotifyProvider from "next-auth/providers/spotify";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyOAuthConfig = OAuthConfig<any>;
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

// 네이버 커스텀 프로바이더
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NaverProvider(options: OAuthUserConfig<any>) {
  return {
    id: "naver",
    name: "Naver",
    type: "oauth" as const,
    authorization: {
      url: "https://nid.naver.com/oauth2.0/authorize",
      params: { scope: "" },
    },
    token: "https://nid.naver.com/oauth2.0/token",
    userinfo: "https://openapi.naver.com/v1/nid/me",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile(profile: any) {
      return {
        id: profile.response.id,
        name: profile.response.name,
        email: profile.response.email,
        image: profile.response.profile_image,
      };
    },
    style: { bg: "#03C75A", text: "#fff" },
    ...options,
  } as AnyOAuthConfig;
}

// 카카오 커스텀 프로바이더
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function KakaoProvider(options: OAuthUserConfig<any>) {
  return {
    id: "kakao",
    name: "Kakao",
    type: "oauth" as const,
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: { scope: "profile_nickname,profile_image,account_email" },
    },
    token: "https://kauth.kakao.com/oauth/token",
    userinfo: "https://kapi.kakao.com/v2/user/me",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile(profile: any) {
      return {
        id: String(profile.id),
        name: profile.kakao_account?.profile?.nickname ?? null,
        email: profile.kakao_account?.email ?? null,
        image: profile.kakao_account?.profile?.profile_image_url ?? null,
      };
    },
    style: { bg: "#FEE500", text: "#3C1E1E" },
    ...options,
  } as AnyOAuthConfig;
}

const providers = [
  GoogleProvider({
    clientId: process.env.AUTH_GOOGLE_ID ?? "",
    clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
  }),
  NaverProvider({
    clientId: process.env.AUTH_NAVER_CLIENT_ID ?? "",
    clientSecret: process.env.AUTH_NAVER_CLIENT_SECRET ?? "",
  }),
  KakaoProvider({
    clientId: process.env.AUTH_KAKAO_CLIENT_ID ?? "",
    clientSecret: process.env.AUTH_KAKAO_CLIENT_SECRET ?? "",
  }),
  GitHubProvider({
    clientId: process.env.AUTH_GITHUB_ID ?? "",
    clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
  }),
  DiscordProvider({
    clientId: process.env.AUTH_DISCORD_ID ?? "",
    clientSecret: process.env.AUTH_DISCORD_SECRET ?? "",
  }),
  SpotifyProvider({
    clientId: process.env.AUTH_SPOTIFY_ID ?? "",
    clientSecret: process.env.AUTH_SPOTIFY_SECRET ?? "",
    authorization:
      "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private",
  }),
  AppleProvider({
    clientId: process.env.AUTH_APPLE_ID ?? "",
    clientSecret: process.env.AUTH_APPLE_SECRET ?? "",
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
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
