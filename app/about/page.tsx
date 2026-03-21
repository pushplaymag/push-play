import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const locale = await getLocale();

  const sections = [
    { labelKey: "whoWeAre" as const, contentKey: "whoWeAreContent" as const },
    { labelKey: "whatWeCover" as const, contentKey: "whatWeCoverContent" as const },
    { labelKey: "submitADemo" as const, contentKey: "submitADemoContent" as const },
  ];

  return (
    <div>
      {/* Header */}
      <div className="border-b border-[#e0ddd8] py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-2">
            {t(locale, "about")}
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-[#0d0b0a]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            push play
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Quote */}
          <div className="flex items-start">
            <p
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#c8c0bb] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              &ldquo;{t(locale, "tagline")}&rdquo;
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {sections.map(({ labelKey, contentKey }) => (
              <div key={labelKey} className="border-t-2 border-[#ff4e5b] pt-6">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-4">
                  {t(locale, labelKey)}
                </h2>
                <p className="text-[#7a706b] leading-relaxed">{t(locale, contentKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
