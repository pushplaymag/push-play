import DemoForm from "@/components/ui/DemoForm";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Demo",
  description: "Submit your artist demo to push play.",
};

export default async function DemoPage() {
  const locale = await getLocale();

  const infoItems = [
    { labelKey: "reviewPeriod" as const, descKey: "reviewPeriodDesc" as const },
    { labelKey: "responseMethod" as const, descKey: "responseMethodDesc" as const },
    { labelKey: "genres" as const, descKey: "genresDesc" as const },
    { labelKey: "regions" as const, descKey: "regionsDesc" as const },
  ];

  return (
    <div>
      {/* Header */}
      <div className="border-b border-[#e0ddd8] py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-2">
            {t(locale, "demoPageLabel")}
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-[#0d0b0a]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t(locale, "demoPageHeading")}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          {/* Left: info */}
          <div className="lg:col-span-1">
            <p className="text-[#7a706b] leading-relaxed mb-8">
              {t(locale, "demoDesc")}
            </p>
            <div className="space-y-6">
              {infoItems.map(({ labelKey, descKey }) => (
                <div key={labelKey} className="border-l-2 border-[#ff4e5b] pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#ff4e5b] mb-0.5">
                    {t(locale, labelKey)}
                  </p>
                  <p className="text-sm text-[#a89e99]">{t(locale, descKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-2">
            <DemoForm locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
