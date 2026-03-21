function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function toSpotifyEmbed(url: string): string {
  return url.replace("https://open.spotify.com/", "https://open.spotify.com/embed/").split("?")[0];
}

type Block =
  | { type: "text"; content: string }
  | { type: "image"; url: string; alt: string; caption: string }
  | { type: "youtube"; url: string }
  | { type: "spotify"; url: string };

export default function ContentRenderer({ content }: { content: string }) {
  let blocks: Block[];

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) throw new Error();
    blocks = parsed;
  } catch {
    // Legacy HTML fallback
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.type === "text") {
          return (
            <div key={i} className="text-[#3a3330] leading-relaxed space-y-4">
              {block.content.split(/\n\n+/).map((para, j) => (
                <p key={j} className="text-base">{para}</p>
              ))}
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={i} className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.url} alt={block.alt || ""} className="w-full object-cover" />
              {block.caption && (
                <figcaption className="text-xs text-[#a89e99] mt-2 text-center">{block.caption}</figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "youtube") {
          const videoId = extractYouTubeId(block.url);
          if (!videoId) return null;
          return (
            <div key={i} className="aspect-video my-8">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }

        if (block.type === "spotify") {
          return (
            <div key={i} className="my-6">
              <iframe
                src={toSpotifyEmbed(block.url)}
                height="152"
                style={{ borderRadius: "4px" }}
                className="w-full"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
