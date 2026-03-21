import type { Locale } from "./i18n";

interface LocalizablePost {
  title: string;
  excerpt: string;
  content: string;
  titleKo?: string | null;
  titleJa?: string | null;
  excerptKo?: string | null;
  excerptJa?: string | null;
  contentKo?: string | null;
  contentJa?: string | null;
}

export function localizePost<T extends LocalizablePost>(post: T, locale: Locale): T {
  return {
    ...post,
    title:
      (locale === "ko" && post.titleKo) ||
      (locale === "ja" && post.titleJa) ||
      post.title,
    excerpt:
      (locale === "ko" && post.excerptKo) ||
      (locale === "ja" && post.excerptJa) ||
      post.excerpt,
    content:
      (locale === "ko" && post.contentKo) ||
      (locale === "ja" && post.contentJa) ||
      post.content,
  };
}
