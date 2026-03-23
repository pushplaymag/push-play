"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={async e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
          const url = await uploadFile(file);
          onUploaded(url);
        } catch (err) {
          alert("이미지 업로드 실패: " + (err instanceof Error ? err.message : "알 수 없는 오류"));
        }
        setUploading(false);
        e.target.value = "";
      }} />
      <button type="button" onClick={() => ref.current?.click()}
        className="text-[10px] font-bold uppercase tracking-widest border border-[#e0ddd8] px-3 py-2 text-[#7a706b] hover:border-[#ff4e5b] hover:text-[#ff4e5b] transition-colors whitespace-nowrap disabled:opacity-50"
        disabled={uploading}>
        {uploading ? "Uploading..." : "Upload File"}
      </button>
    </>
  );
}

type BlockType = "text" | "image" | "youtube" | "spotify";

interface TextBlock { id: string; type: "text"; content: string }
interface ImageBlock { id: string; type: "image"; url: string; alt: string; caption: string }
interface YouTubeBlock { id: string; type: "youtube"; url: string }
interface SpotifyBlock { id: string; type: "spotify"; url: string }
type Block = TextBlock | ImageBlock | YouTubeBlock | SpotifyBlock;

function uid() { return Math.random().toString(36).slice(2, 9); }

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function toSpotifyEmbed(url: string): string {
  return url.replace("https://open.spotify.com/", "https://open.spotify.com/embed/").split("?")[0];
}

interface InitialData {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  titleKo: string | null;
  excerptKo: string | null;
  contentKo: string | null;
  titleJa: string | null;
  excerptJa: string | null;
  contentJa: string | null;
  coverImage: string | null;
  category: string;
  author: string;
  published: boolean;
  featured: boolean;
  rating: number | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  country: string | null;
}

export default function PostForm({ initialData }: { initialData?: InitialData }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "news");
  const [author, setAuthor] = useState(initialData?.author ?? "push play");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [rating, setRating] = useState(initialData?.rating?.toString() ?? "");
  const [artist, setArtist] = useState(initialData?.artist ?? "");
  const [album, setAlbum] = useState(initialData?.album ?? "");
  const [genre, setGenre] = useState(initialData?.genre ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "");
  const [langTab, setLangTab] = useState<"en" | "ko" | "ja">("en");
  const [titleKo, setTitleKo] = useState(initialData?.titleKo ?? "");
  const [excerptKo, setExcerptKo] = useState(initialData?.excerptKo ?? "");
  const [titleJa, setTitleJa] = useState(initialData?.titleJa ?? "");
  const [excerptJa, setExcerptJa] = useState(initialData?.excerptJa ?? "");
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");
  const [insertMenuAt, setInsertMenuAt] = useState<number | null>(null);

  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (!initialData?.content) return [{ id: uid(), type: "text", content: "" }];
    try {
      const parsed = JSON.parse(initialData.content);
      if (Array.isArray(parsed)) return parsed.map(b => ({ ...b, id: b.id || uid() }));
    } catch { /* fallback */ }
    return [{ id: uid(), type: "text", content: initialData.content }];
  });

  const [blocksKo, setBlocksKo] = useState<Block[]>(() => {
    if (!initialData?.contentKo) return [{ id: uid(), type: "text", content: "" }];
    try {
      const parsed = JSON.parse(initialData.contentKo);
      if (Array.isArray(parsed)) return parsed.map(b => ({ ...b, id: b.id || uid() }));
    } catch { /* fallback */ }
    return [{ id: uid(), type: "text", content: initialData.contentKo }];
  });

  const [blocksJa, setBlocksJa] = useState<Block[]>(() => {
    if (!initialData?.contentJa) return [{ id: uid(), type: "text", content: "" }];
    try {
      const parsed = JSON.parse(initialData.contentJa);
      if (Array.isArray(parsed)) return parsed.map(b => ({ ...b, id: b.id || uid() }));
    } catch { /* fallback */ }
    return [{ id: uid(), type: "text", content: initialData.contentJa }];
  });

  function makeBlock(type: BlockType): Block {
    const id = uid();
    if (type === "text") return { id, type: "text", content: "" };
    if (type === "image") return { id, type: "image", url: "", alt: "", caption: "" };
    if (type === "youtube") return { id, type: "youtube", url: "" };
    return { id, type: "spotify", url: "" };
  }

  function makeBlockActions(setter: React.Dispatch<React.SetStateAction<Block[]>>) {
    return {
      add(type: BlockType) {
        setter(prev => [...prev, makeBlock(type)]);
      },
      insertAt(afterIndex: number, type: BlockType) {
        setter(prev => {
          const next = [...prev];
          next.splice(afterIndex + 1, 0, makeBlock(type));
          return next;
        });
      },
      remove(id: string) {
        setter(prev => prev.filter(b => b.id !== id));
      },
      move(id: string, dir: -1 | 1) {
        setter(prev => {
          const idx = prev.findIndex(b => b.id === id);
          if (idx === -1) return prev;
          const next = [...prev];
          const swap = idx + dir;
          if (swap < 0 || swap >= next.length) return prev;
          [next[idx], next[swap]] = [next[swap], next[idx]];
          return next;
        });
      },
      update(id: string, updates: Partial<Block>) {
        setter(prev => prev.map(b => b.id === id ? { ...b, ...updates } as Block : b));
      },
    };
  }

  const enActions = makeBlockActions(setBlocks);
  const koActions = makeBlockActions(setBlocksKo);
  const jaActions = makeBlockActions(setBlocksJa);

  const activeBlocks = langTab === "ko" ? blocksKo : langTab === "ja" ? blocksJa : blocks;
  const activeActions = langTab === "ko" ? koActions : langTab === "ja" ? jaActions : enActions;

  async function autoTranslate() {
    // Source: current active tab
    const sourceLang = langTab;
    const sourceTitle = sourceLang === "ko" ? titleKo : sourceLang === "ja" ? titleJa : title;
    const sourceExcerpt = sourceLang === "ko" ? excerptKo : sourceLang === "ja" ? excerptJa : excerpt;
    const sourceBlocks = sourceLang === "ko" ? blocksKo : sourceLang === "ja" ? blocksJa : blocks;

    if (!sourceTitle && !sourceExcerpt) {
      setError("현재 탭에 번역할 내용이 없습니다. 제목이나 요약을 먼저 입력하세요.");
      return;
    }

    setTranslating(true);
    setError("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang,
          title: sourceTitle,
          excerpt: sourceExcerpt,
          blocks: sourceBlocks,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "번역에 실패했습니다.");
        return;
      }

      const result = await res.json();

      // Fill in all languages except the source
      if (result.en && sourceLang !== "en") {
        setTitle(result.en.title);
        setExcerpt(result.en.excerpt);
        setBlocks(result.en.blocks);
      }
      if (result.ko && sourceLang !== "ko") {
        setTitleKo(result.ko.title);
        setExcerptKo(result.ko.excerpt);
        setBlocksKo(result.ko.blocks);
      }
      if (result.ja && sourceLang !== "ja") {
        setTitleJa(result.ja.title);
        setExcerptJa(result.ja.excerpt);
        setBlocksJa(result.ja.blocks);
      }
    } catch {
      setError("번역 중 오류가 발생했습니다. 다시 시도하세요.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title,
      excerpt,
      content: JSON.stringify(blocks),
      titleKo: titleKo || null,
      excerptKo: excerptKo || null,
      contentKo: JSON.stringify(blocksKo),
      titleJa: titleJa || null,
      excerptJa: excerptJa || null,
      contentJa: JSON.stringify(blocksJa),
      coverImage: coverImage || null,
      category,
      author,
      published,
      featured,
      rating: rating ? parseFloat(rating) : null,
      artist: artist || null,
      album: album || null,
      genre: genre || null,
      country: country || null,
      tags: JSON.stringify([]),
    };

    try {
      const res = isEdit
        ? await fetch(`/api/posts/${initialData!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        setSaving(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-[#e0ddd8] px-3 py-2 text-sm bg-white text-[#0d0b0a] focus:outline-none focus:border-[#ff4e5b]";
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-[#a89e99] mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-2">{error}</p>}

      {/* Category + Author */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category *</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            <option value="news">News</option>
            <option value="review">Review</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Author</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Language Tabs */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex gap-0 border-b border-[#e0ddd8] overflow-x-auto flex-1">
            {(["en", "ko", "ja"] as const).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setLangTab(lang)}
                className={`flex-shrink-0 px-4 sm:px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors touch-manipulation ${
                  langTab === lang
                    ? "border-[#ff4e5b] text-[#ff4e5b]"
                    : "border-transparent text-[#a89e99] hover:text-[#7a706b]"
                }`}
              >
                {lang === "en" ? "English (원본)" : lang === "ko" ? "한국어" : "日本語"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={autoTranslate}
            disabled={translating || saving}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-[#e0ddd8] text-[#7a706b] hover:border-[#ff4e5b] hover:text-[#ff4e5b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation whitespace-nowrap"
          >
            <span className="text-sm leading-none">{translating ? "⏳" : "🌐"}</span>
            {translating ? "번역 중..." : "자동번역"}
          </button>
        </div>

        {langTab === "en" && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Post title (or fill via 자동번역)" className={`${inputCls} text-lg font-bold`} />
            </div>
            <div>
              <label className={labelCls}>Excerpt *</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
                rows={2} placeholder="Short description shown in listings..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}

        {langTab === "ko" && (
          <div className="space-y-4">
            <p className="text-[10px] text-[#a89e99] mb-2">비워두면 원본(영어)이 표시됩니다. 이 탭에서 한국어로 작성 후 &apos;자동번역&apos;을 누르면 나머지 언어가 채워집니다.</p>
            <div>
              <label className={labelCls}>제목 (한국어)</label>
              <input value={titleKo} onChange={e => setTitleKo(e.target.value)}
                placeholder="한국어 제목" className={`${inputCls} text-lg font-bold`} />
            </div>
            <div>
              <label className={labelCls}>요약 (한국어)</label>
              <textarea value={excerptKo} onChange={e => setExcerptKo(e.target.value)}
                rows={2} placeholder="목록에 표시되는 짧은 설명..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}

        {langTab === "ja" && (
          <div className="space-y-4">
            <p className="text-[10px] text-[#a89e99] mb-2">空白の場合、元の言語（英語）が表示されます。</p>
            <div>
              <label className={labelCls}>タイトル（日本語）</label>
              <input value={titleJa} onChange={e => setTitleJa(e.target.value)}
                placeholder="日本語タイトル" className={`${inputCls} text-lg font-bold`} />
            </div>
            <div>
              <label className={labelCls}>要約（日本語）</label>
              <textarea value={excerptJa} onChange={e => setExcerptJa(e.target.value)}
                rows={2} placeholder="一覧に表示される短い説明..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}
      </div>

      {/* Cover Image */}
      <div>
        <label className={labelCls}>Cover Image</label>
        <p className="text-[10px] text-[#a89e99] mb-1.5">권장 사이즈: 1200 × 800px (3:2 비율) · JPG/PNG · 2MB 이하</p>
        <div className="flex gap-2">
          <input value={coverImage} onChange={e => setCoverImage(e.target.value)}
            placeholder="https://... or upload a file" className={inputCls} />
          <ImageUploadButton onUploaded={url => setCoverImage(url)} />
        </div>
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="cover preview" className="mt-2 h-32 w-full object-cover border border-[#e0ddd8]" />
        )}
      </div>

      {/* Review fields */}
      {category === "review" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[#f8f7f5] border border-[#e0ddd8]">
          <div>
            <label className={labelCls}>Artist</label>
            <input value={artist} onChange={e => setArtist(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Album / Track</label>
            <input value={album} onChange={e => setAlbum(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Genre</label>
            <input value={genre} onChange={e => setGenre(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" value={rating}
              onChange={e => setRating(e.target.value)} className={inputCls} />
          </div>
        </div>
      )}

      {/* Block Editor */}
      <div>
        <label className={labelCls}>
          Content
          {langTab !== "en" && <span className="ml-2 text-[#a89e99] normal-case tracking-normal">(비워두면 원본 표시)</span>}
        </label>

        {/* Insert-between menu component */}
        {activeBlocks.length === 0 ? (
          <div className="border-2 border-dashed border-[#e0ddd8] p-6 text-center">
            <p className="text-xs text-[#a89e99] mb-3">블록을 추가해 글을 작성하세요</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(["text", "image", "youtube", "spotify"] as BlockType[]).map(type => (
                <button key={type} type="button" onClick={() => activeActions.add(type)}
                  className="text-[10px] font-bold uppercase tracking-widest border border-[#e0ddd8] px-4 py-2 text-[#7a706b] hover:border-[#ff4e5b] hover:text-[#ff4e5b] transition-colors">
                  + {type}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {activeBlocks.map((block, idx) => (
              <div key={block.id}>
                {/* Block */}
                <div className="border border-[#e0ddd8] bg-white">
                  {/* Block toolbar */}
                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#f8f7f5] border-b border-[#e0ddd8]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99]">
                      {block.type === "text" ? "📝 Text" : block.type === "image" ? "🖼 Image" : block.type === "youtube" ? "▶ YouTube" : "🎵 Spotify"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => activeActions.move(block.id, -1)} disabled={idx === 0}
                        className="text-[#a89e99] hover:text-[#0d0b0a] disabled:opacity-30 px-2 py-1 text-sm touch-manipulation">↑</button>
                      <button type="button" onClick={() => activeActions.move(block.id, 1)} disabled={idx === activeBlocks.length - 1}
                        className="text-[#a89e99] hover:text-[#0d0b0a] disabled:opacity-30 px-2 py-1 text-sm touch-manipulation">↓</button>
                      <button type="button" onClick={() => activeActions.remove(block.id)}
                        className="text-[#a89e99] hover:text-red-500 active:text-red-600 px-2 py-1 text-sm ml-1 touch-manipulation">✕</button>
                    </div>
                  </div>

                  {/* Block body */}
                  <div className="p-3">
                    {block.type === "text" && (
                      <textarea
                        value={block.content}
                        onChange={e => activeActions.update(block.id, { content: e.target.value })}
                        rows={6}
                        placeholder="텍스트를 입력하세요... (빈 줄 두 번 = 새 단락)"
                        className="w-full text-sm text-[#0d0b0a] focus:outline-none resize-y leading-relaxed"
                      />
                    )}

                    {block.type === "image" && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input value={block.url} onChange={e => activeActions.update(block.id, { url: e.target.value })}
                            placeholder="이미지 URL (https://...) 또는 파일 업로드" className={inputCls} />
                          <ImageUploadButton onUploaded={url => activeActions.update(block.id, { url })} />
                        </div>
                        <input value={block.alt} onChange={e => activeActions.update(block.id, { alt: e.target.value })}
                          placeholder="대체 텍스트 (alt text)" className={inputCls} />
                        <input value={block.caption} onChange={e => activeActions.update(block.id, { caption: e.target.value })}
                          placeholder="캡션 (선택사항)" className={inputCls} />
                        {block.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={block.url} alt={block.alt} className="max-h-48 w-full object-contain border border-[#e0ddd8] mt-1" />
                        )}
                      </div>
                    )}

                    {block.type === "youtube" && (
                      <div className="space-y-2">
                        <input value={block.url} onChange={e => activeActions.update(block.id, { url: e.target.value })}
                          placeholder="YouTube URL (https://www.youtube.com/watch?v=...)" className={inputCls} />
                        {extractYouTubeId(block.url) && (
                          <div className="aspect-video">
                            <iframe
                              src={`https://www.youtube.com/embed/${extractYouTubeId(block.url)}`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {block.type === "spotify" && (
                      <div className="space-y-2">
                        <input value={block.url} onChange={e => activeActions.update(block.id, { url: e.target.value })}
                          placeholder="Spotify URL (트랙, 앨범, 또는 플레이리스트)" className={inputCls} />
                        {block.url && (
                          <iframe
                            src={toSpotifyEmbed(block.url)}
                            height="152"
                            style={{ borderRadius: "4px" }}
                            className="w-full"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Insert-between strip */}
                <div className="relative h-6 flex items-center justify-center group">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#e0ddd8] group-hover:bg-[#ff4e5b] transition-colors" />
                  {insertMenuAt === idx ? (
                    <div className="relative z-10 flex items-center gap-1 bg-white border border-[#ff4e5b] px-2 py-1 shadow-sm">
                      {(["text", "image", "youtube", "spotify"] as BlockType[]).map(type => (
                        <button key={type} type="button"
                          onClick={() => { activeActions.insertAt(idx, type); setInsertMenuAt(null); }}
                          className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 text-[#ff4e5b] hover:bg-[#ff4e5b] hover:text-white transition-colors">
                          {type === "text" ? "📝" : type === "image" ? "🖼" : type === "youtube" ? "▶" : "🎵"} {type}
                        </button>
                      ))}
                      <button type="button" onClick={() => setInsertMenuAt(null)}
                        className="text-[#a89e99] hover:text-[#0d0b0a] px-1 text-xs ml-1">✕</button>
                    </div>
                  ) : (
                    <button type="button"
                      onClick={() => setInsertMenuAt(insertMenuAt === idx ? null : idx)}
                      className="relative z-10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white border border-[#e0ddd8] hover:border-[#ff4e5b] hover:text-[#ff4e5b] text-[#a89e99] text-xs px-2 py-0.5 rounded-full font-bold touch-manipulation">
                      + 삽입
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add to end */}
            <div className="flex flex-wrap gap-2 mt-2">
              {(["text", "image", "youtube", "spotify"] as BlockType[]).map(type => (
                <button key={type} type="button" onClick={() => { activeActions.add(type); setInsertMenuAt(null); }}
                  className="text-[10px] font-bold uppercase tracking-widest border border-[#e0ddd8] px-4 py-2 text-[#7a706b] hover:border-[#ff4e5b] hover:text-[#ff4e5b] transition-colors">
                  + {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6 flex-wrap">
        {[
          { label: "Published", value: published, set: setPublished },
          { label: "Featured", value: featured, set: setFeatured },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer select-none touch-manipulation py-1">
            <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} className="sr-only" />
            <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-[#ff4e5b]" : "bg-[#e0ddd8]"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7a706b]">{label}</span>
          </label>
        ))}
      </div>

      {/* Submit — desktop only (bottom of form) */}
      <div className="hidden sm:flex items-center gap-4 pt-4 border-t border-[#e0ddd8]">
        <button
          type="submit"
          disabled={saving}
          className="text-xs font-black uppercase tracking-widest bg-[#ff4e5b] text-white px-8 py-3.5 hover:bg-[#e03040] active:bg-[#c02030] transition-colors disabled:opacity-50 touch-manipulation"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
        </button>
        <a href="/admin" className="text-xs font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#0d0b0a] transition-colors touch-manipulation">
          Cancel
        </a>
      </div>

      {/* Sticky bottom bar — mobile only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e0ddd8] px-4 py-3 flex items-center gap-3 shadow-lg">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 text-xs font-black uppercase tracking-widest bg-[#ff4e5b] text-white py-3.5 hover:bg-[#e03040] active:bg-[#c02030] transition-colors disabled:opacity-50 touch-manipulation"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
        </button>
        <a href="/admin" className="text-xs font-bold uppercase tracking-widest text-[#a89e99] touch-manipulation px-4 py-3.5 border border-[#e0ddd8]">
          Cancel
        </a>
      </div>

      {/* Bottom padding so sticky bar doesn't cover last field on mobile */}
      <div className="sm:hidden h-20" />
    </form>
  );
}
