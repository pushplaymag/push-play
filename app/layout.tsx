import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/nav-config";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL("https://www.pushplaymag.net"),
  openGraph: {
    siteName: SITE_CONFIG.name,
    type: "website",
    locale: "ko_KR",
    url: "https://www.pushplaymag.net",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: SITE_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  icons: [
    { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png" },
    { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
  ],
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable}`}>
      <body className="bg-white text-[#0d0b0a] min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
