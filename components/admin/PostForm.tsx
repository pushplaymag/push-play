"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
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
        } catch { /* ignore */ }
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
  const [error, setError] = useState("");

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

  function makeBlockActions(setter: React.Dispatch<React.SetStateAction<Block[]>>) {
    return {
      add(type: BlockType) {
        const id = uid();
        let block: Block;
        if (type === "text") block = { id, type: "text", content: "" };
        else if (type === "image") block = { id, type: "image", url: "", alt: "", caption: "" };
        else if (type === "youtube") block = { id, type: "youtube", url: "" };
        else block = { id, type: "spotify", url: "" };
        setter(prev => [...prev, block]);
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
      tags: [],
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
      <div className="grid grid-cols-2 gap-4">
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
        <div className="flex gap-0 border-b border-[#e0ddd8] mb-4">
          {(["en", "ko", "ja"] as const).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setLangTab(lang)}
              className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-px transition-colors ${
                langTab === lang
                  ? "border-[#ff4e5b] text-[#ff4e5b]"
                  : "border-transparent text-[#a89e99] hover:text-[#7a706b]"
              }`}
            >
              {lang === "en" ? "English (원본)" : lang === "ko" ? "한국어" : "日本語"}
            </button>
          ))}
        </div>

        {langTab === "en" && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Post title" className={`${inputCls} text-lg font-bold`} />
            </div>
            <div>
              <label className={labelCls}>Excerpt *</label>
              <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)}
                rows={2} placeholder="Short description shown in listings..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>
        )}

        {langTab === "ko" && (
          <div className="space-y-4">
            <p className="text-[10px] text-[#a89e99] mb-2">비워두면 원본(영어)이 표시됩니다.</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-[#f8f7f5] border border-[#e0ddd8]">
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
            <label className={labelCls}>Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className={inputCls}>
              <option value="">Select</option>
              <option value="kr">Korea</option>
              <option value="jp">Japan</option>
              <option value="asia">Asia</option>
              <option value="en">UK / US</option>
            </select>
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
        <div className="space-y-3">
          {activeBlocks.map((block, idx) => (
            <div key={block.id} className="border border-[#e0ddd8] bg-white">
              {/* Block toolbar */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#f8f7f5] border-b border-[#e0ddd8]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a89e99]">
                  {block.type}
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => activeActions.move(block.id, -1)} disabled={idx === 0}
                    className="text-[#a89e99] hover:text-[#0d0b0a] disabled:opacity-30 px-1.5 text-xs">↑</button>
                  <button type="button" onClick={() => activeActions.move(block.id, 1)} disabled={idx === activeBlocks.length - 1}
                    className="text-[#a89e99] hover:text-[#0d0b0a] disabled:opacity-30 px-1.5 text-xs">↓</button>
                  <button type="button" onClick={() => activeActions.remove(block.id)}
                    className="text-[#a89e99] hover:text-red-500 px-1.5 text-xs ml-1">✕</button>
                </div>
              </div>

              {/* Block body */}
              <div className="p-3">
                {block.type === "text" && (
                  <textarea
                    value={block.content}
                    onChange={e => activeActions.update(block.id, { content: e.target.value })}
                    rows={6}
                    placeholder="Write your text here... (double line break = new paragraph)"
                    className="w-full text-sm text-[#0d0b0a] focus:outline-none resize-y leading-relaxed"
                  />
                )}

                {block.type === "image" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input value={block.url} onChange={e => activeActions.update(block.id, { url: e.target.value })}
                        placeholder="Image URL (https://... or upload a file)" className={inputCls} />
                      <ImageUploadButton onUploaded={url => activeActions.update(block.id, { url })} />
                    </div>
                    <input value={block.alt} onChange={e => activeActions.update(block.id, { alt: e.target.value })}
                      placeholder="Alt text" className={inputCls} />
                    <input value={block.caption} onChange={e => activeActions.update(block.id, { caption: e.target.value })}
                      placeholder="Caption (optional)" className={inputCls} />
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
                      placeholder="Spotify URL (track, album, or playlist)" className={inputCls} />
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
          ))}
        </div>

        {/* Add block buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(["text", "image", "youtube", "spotify"] as BlockType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => activeActions.add(type)}
              className="text-[10px] font-bold uppercase tracking-widest border border-[#e0ddd8] px-4 py-2 text-[#7a706b] hover:border-[#ff4e5b] hover:text-[#ff4e5b] transition-colors"
            >
              + {type}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        {[
          { label: "Published", value: published, set: setPublished },
          { label: "Featured", value: featured, set: setFeatured },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} className="sr-only" />
            <div className={`w-9 h-5 rounded-full transition-colors relative ${value ? "bg-[#ff4e5b]" : "bg-[#e0ddd8]"}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#7a706b]">{label}</span>
          </label>
        ))}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#e0ddd8]">
        <button
          type="submit"
          disabled={saving}
          className="text-xs font-black uppercase tracking-widest bg-[#ff4e5b] text-white px-8 py-3 hover:bg-[#e03040] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Post"}
        </button>
        <a href="/admin" className="text-xs font-bold uppercase tracking-widest text-[#a89e99] hover:text-[#0d0b0a] transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
