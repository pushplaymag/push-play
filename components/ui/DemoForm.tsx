"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const GENRES = [
  "Indie Pop", "Indie Rock", "Post-Rock", "Shoegaze", "Dream Pop",
  "Electronic", "Ambient", "Jazz", "R&B / Soul", "Hip-Hop",
  "Folk", "Classical Crossover", "World Music", "Other",
];

const COUNTRIES = [
  { value: "kr", label: "South Korea" }, { value: "jp", label: "Japan" },
  { value: "cn", label: "China" }, { value: "tw", label: "Taiwan" },
  { value: "hk", label: "Hong Kong" }, { value: "th", label: "Thailand" },
  { value: "sg", label: "Singapore" }, { value: "id", label: "Indonesia" },
  { value: "ph", label: "Philippines" }, { value: "vn", label: "Vietnam" },
  { value: "us", label: "United States" }, { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" }, { value: "ca", label: "Canada" },
  { value: "other", label: "Other" },
];

interface FormState {
  artistName: string; email: string; country: string; genre: string;
  description: string; soundcloud: string; bandcamp: string;
  youtube: string; spotify: string; website: string;
}

const INITIAL: FormState = {
  artistName: "", email: "", country: "", genre: "", description: "",
  soundcloud: "", bandcamp: "", youtube: "", spotify: "", website: "",
};

const inputClass = "w-full bg-[#eeece8] border border-[#e0ddd8] px-4 py-3 text-sm text-[#3a3330] placeholder-[#b8b0ab] focus:outline-none focus:border-[#ff4e5b] transition-colors";

export default function DemoForm({ locale }: { locale: Locale }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistName: form.artistName, email: form.email,
          country: form.country, genre: form.genre,
          description: form.description,
          links: { soundcloud: form.soundcloud, bandcamp: form.bandcamp,
            youtube: form.youtube, spotify: form.spotify, website: form.website },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "An error occurred during submission.");
      }
      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="border border-[#e0ddd8] bg-[#eeece8] p-12 text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#ff4e5b] mb-4">
          {t(locale, "submitted")}
        </p>
        <h2
          className="text-2xl font-black text-[#0d0b0a] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t(locale, "demoReceived")}
        </h2>
        <p className="text-sm text-[#a89e99] mb-8">
          {t(locale, "demoReceivedDesc")}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-bold tracking-widest uppercase text-[#ff4e5b] border border-[#ff4e5b] px-6 py-2.5 hover:bg-[#ff4e5b] hover:text-white transition-colors"
        >
          {t(locale, "submitAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div>
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#a89e99] mb-4 pb-2 border-b border-[#e0ddd8]">
          {t(locale, "basicInfo")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#a89e99] mb-2">
              {t(locale, "artistName")} <span className="text-[#ff4e5b]">*</span>
            </label>
            <input name="artistName" value={form.artistName} onChange={handleChange} required placeholder="Solo artist or band name" className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#a89e99] mb-2">
              {t(locale, "email")} <span className="text-[#ff4e5b]">*</span>
            </label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="contact@example.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#a89e99] mb-2">
              {t(locale, "country")} <span className="text-[#ff4e5b]">*</span>
            </label>
            <select name="country" value={form.country} onChange={handleChange} required className={inputClass}>
              <option value="">{t(locale, "selectCountry")}</option>
              {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#a89e99] mb-2">
              {t(locale, "genre")} <span className="text-[#ff4e5b]">*</span>
            </label>
            <select name="genre" value={form.genre} onChange={handleChange} required className={inputClass}>
              <option value="">{t(locale, "selectGenre")}</option>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#a89e99] mb-4 pb-2 border-b border-[#e0ddd8]">
          {t(locale, "artistBio")} <span className="text-[#ff4e5b]">*</span>
        </h3>
        <textarea
          name="description" value={form.description} onChange={handleChange} required rows={6}
          placeholder={t(locale, "artistBioPlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Links */}
      <div>
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#a89e99] mb-4 pb-2 border-b border-[#e0ddd8]">
          {t(locale, "musicLinks")} <span className="text-[#ff4e5b]">*</span>
          <span className="text-[#5a5250] ml-2 normal-case tracking-normal">{t(locale, "atLeastOne")}</span>
        </h3>
        <div className="space-y-3">
          {[
            { name: "soundcloud", placeholder: "SoundCloud URL" },
            { name: "bandcamp", placeholder: "Bandcamp URL" },
            { name: "youtube", placeholder: "YouTube URL" },
            { name: "spotify", placeholder: "Spotify URL" },
            { name: "website", placeholder: t(locale, "officialWebsite") },
          ].map((f) => (
            <input
              key={f.name} name={f.name}
              value={form[f.name as keyof FormState]}
              onChange={handleChange} placeholder={f.placeholder}
              className={inputClass}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400/80 border border-red-400/20 bg-red-400/5 px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit" disabled={submitting}
        className="w-full py-4 text-[11px] tracking-[0.3em] uppercase font-semibold bg-[#ff4e5b] text-white hover:bg-[#e03040] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? t(locale, "submitting") : t(locale, "submitDemoForm")}
      </button>
    </form>
  );
}
