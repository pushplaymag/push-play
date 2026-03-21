import { headers } from "next/headers";
import type { Locale } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const locale = h.get("x-locale");
  if (locale === "ko" || locale === "ja") return locale;
  return "en";
}
