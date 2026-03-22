import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: `Image upload not configured (cloud:${!!cloudName} key:${!!apiKey} secret:${!!apiSecret})` },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "push-play";
  const sigStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha256").update(sigStr).digest("hex");

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", timestamp);
  uploadForm.append("signature", signature);
  uploadForm.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadForm,
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.message ?? "Upload failed" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ url: data.secure_url });
}
