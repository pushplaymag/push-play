import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG, NAV_ITEMS } from "@/lib/nav-config";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function Footer() {
  const locale = await getLocale();

  return (
    <footer className="bg-[#f0f0f0] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-10 border-b border-[#d8d8d8]">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt={SITE_CONFIG.name}
                width={64}
                height={64}
                className="object-contain"
              />
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-3">
              {t(locale, "tagline")}
            </p>
            <p className="text-sm text-[#555] leading-relaxed max-w-xs">
              {t(locale, "siteDesc")}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-5">
              {t(locale, "sections")}
            </h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#333] hover:text-[#ff4e5b] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-5">
              {t(locale, "artists")}
            </h4>
            <p className="text-sm text-[#555] mb-5 leading-relaxed">
              {t(locale, "footerArtistDesc")}
            </p>
            <Link
              href="/demo"
              className="inline-block text-xs font-bold uppercase tracking-widest text-[#ff4e5b] border border-[#ff4e5b] px-4 py-2 hover:bg-[#ff4e5b] hover:text-white transition-colors"
            >
              {t(locale, "submitDemoBtn")}
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <p className="text-[10px] text-[#999] uppercase tracking-wider">
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <a
              href="mailto:info.pushplaymag@gmail.com"
              className="text-[10px] text-[#999] uppercase tracking-wider hover:text-[#ff4e5b] transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Follow row */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-[#0d0b0a] uppercase tracking-widest">
              {t(locale, "follow")}
            </span>
            {SITE_CONFIG.socials.instagram && (
              <a
                href={SITE_CONFIG.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0d0b0a] hover:text-[#ff4e5b] transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            )}
            {SITE_CONFIG.socials.spotify && (
              <a
                href={SITE_CONFIG.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0d0b0a] hover:text-[#ff4e5b] transition-colors"
                aria-label="Spotify"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
