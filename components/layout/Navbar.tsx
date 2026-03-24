"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { NAV_ITEMS, SITE_CONFIG, type NavItem } from "@/lib/nav-config";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";

function DropdownMenu({ items }: { items: NavItem[] }) {
  return (
    <div className="absolute top-full left-0 mt-0 w-44 bg-white border border-[#e0ddd8] shadow-2xl py-1 z-50">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2.5 text-sm text-[#7a706b] hover:text-[#0d0b0a] hover:bg-[#eeece8] transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);

  if (item.children && item.children.length > 0) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-[#0d0b0a] hover:text-[#ff4e5b] transition-colors h-16 border-b-2 border-transparent hover:border-[#ff4e5b]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {item.label}
          <ChevronDown size={11} />
        </button>
        {open && <DropdownMenu items={item.children} />}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className="text-sm font-bold uppercase tracking-widest text-[#0d0b0a] hover:text-[#ff4e5b] transition-colors h-16 flex items-center border-b-2 border-transparent hover:border-[#ff4e5b]"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {item.label}
    </Link>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e0ddd8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-20 flex items-center gap-6 lg:gap-10">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          {!logoError ? (
            <Image
              src="/logo.png"
              alt="push play"
              width={52}
              height={52}
              className="object-contain"
              priority
              onError={() => setLogoError(true)}
            />
          ) : (
            <span
              className="text-xl font-black text-[#0d0b0a] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              push play
            </span>
          )}
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-7 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Social icons — desktop */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {SITE_CONFIG.socials.instagram && (
            <a href={SITE_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-[#0d0b0a] hover:text-[#ff4e5b] transition-colors" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
          )}
          {SITE_CONFIG.socials.spotify && (
            <a href={SITE_CONFIG.socials.spotify} target="_blank" rel="noopener noreferrer" className="text-[#0d0b0a] hover:text-[#ff4e5b] transition-colors" aria-label="Spotify">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </a>
          )}
        </div>

        {/* Auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-xs text-[#7a706b] hover:text-[#0d0b0a] transition-colors"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="profile"
                    width={26}
                    height={26}
                    className="rounded-full"
                  />
                ) : (
                  <User size={15} />
                )}
                <span className="max-w-24 truncate font-medium">{session.user?.name}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-[#e0ddd8] shadow-xl py-1 z-50">
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#7a706b] hover:text-[#0d0b0a] hover:bg-[#eeece8] transition-colors"
                  >
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-sm font-bold uppercase tracking-widest text-[#ff4e5b] border border-[#ff4e5b] px-4 py-1.5 hover:bg-[#ff4e5b] hover:text-white transition-colors"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden ml-auto text-[#7a706b] hover:text-[#0d0b0a]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e0ddd8] bg-white px-4 py-4">
          {NAV_ITEMS.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="flex items-center text-sm font-bold uppercase tracking-widest text-[#7a706b] hover:text-[#0d0b0a] py-3 border-b border-[#eeece8] transition-colors"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="pl-4 pb-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block text-xs text-[#a89e99] hover:text-[#7a706b] py-2 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4 mt-2 border-t border-[#e0ddd8]">
            {session ? (
              <button
                onClick={() => signOut()}
                className="text-xs font-bold uppercase tracking-widest text-[#7a706b] hover:text-[#ff4e5b] transition-colors"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-xs font-bold uppercase tracking-widest text-[#ff4e5b]"
              >
                Sign in / Join
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
