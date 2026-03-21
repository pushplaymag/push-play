import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

type Block = {
  id: string;
  type: string;
  content?: string;
  url?: string;
  alt?: string;
  caption?: string;
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ko: "Korean",
  ja: "Japanese",
};

export async function POST(request: NextRequest) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { sourceLang, title, excerpt, blocks } = await request.json();

  if (!sourceLang || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Collect text block contents (preserve indices for reconstruction)
  const textBlockIndices: number[] = [];
  const textContents: string[] = [];
  (blocks as Block[]).forEach((block, i) => {
    if (block.type === "text" && block.content) {
      textBlockIndices.push(i);
      textContents.push(block.content);
    }
  });

  const sourceName = LANG_NAMES[sourceLang] ?? sourceLang;

  const prompt = `You are a professional music magazine translator. Translate the following content from ${sourceName} into all three languages: English, Korean, and Japanese.

Return ONLY a valid JSON object with this exact structure (no extra text, no markdown code fences):
{
  "en": {
    "title": "...",
    "excerpt": "...",
    "textBlocks": ["text for block 0", "text for block 1", ...]
  },
  "ko": {
    "title": "...",
    "excerpt": "...",
    "textBlocks": ["text for block 0", "text for block 1", ...]
  },
  "ja": {
    "title": "...",
    "excerpt": "...",
    "textBlocks": ["text for block 0", "text for block 1", ...]
  }
}

Rules:
- For the source language (${sourceName}), copy the original text unchanged.
- Translate music terminology appropriately for each target language.
- Maintain the tone and style of an independent music magazine.
- The "textBlocks" array must have exactly ${textContents.length} element(s), one per input block (same order).
- Preserve paragraph structure (double newlines between paragraphs).

SOURCE LANGUAGE: ${sourceName}

TITLE: ${title}

EXCERPT: ${excerpt}

TEXT BLOCKS:
${textContents.map((t, i) => `[${i}]: ${t}`).join("\n\n")}`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code fences if present
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/```\s*$/m, "")
      .trim();

    let translations: Record<string, { title: string; excerpt: string; textBlocks: string[] }>;
    try {
      translations = JSON.parse(cleaned);
    } catch {
      // Try to find JSON object in response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json({ error: "Translation returned invalid JSON" }, { status: 500 });
      }
      translations = JSON.parse(jsonMatch[0]);
    }

    // Reconstruct blocks for each language
    const result: Record<string, { title: string; excerpt: string; blocks: Block[] }> = {};

    for (const lang of ["en", "ko", "ja"]) {
      const trans = translations[lang];
      if (!trans) continue;

      const translatedBlocks: Block[] = (blocks as Block[]).map((block, i) => {
        if (block.type === "text") {
          const textIdx = textBlockIndices.indexOf(i);
          const translatedText =
            textIdx >= 0 && trans.textBlocks?.[textIdx] != null
              ? trans.textBlocks[textIdx]
              : block.content ?? "";
          return { ...block, content: translatedText };
        }
        // Non-text blocks (image, youtube, spotify) are preserved as-is
        return { ...block };
      });

      result[lang] = {
        title: trans.title ?? title,
        excerpt: trans.excerpt ?? excerpt,
        blocks: translatedBlocks,
      };
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Translation error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
